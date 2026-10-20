import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';

// Isolated server, disposable credentials, deliberately no database connection.
// Never tests mutations against a live store.
const base = 'http://localhost:3018';
const artifacts = path.resolve('test-artifacts');
await mkdir(artifacts, { recursive: true });
const password = randomBytes(24).toString('hex');
const email = 'preview@example.invalid';
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', 'localhost', '--port', '3018'], {
  env: { ...process.env, MONGODB_URI: '', ADMIN_EMAIL: email, ADMIN_PASSWORD: password, ADMIN_SESSION_SECRET: randomBytes(32).toString('hex') },
  windowsHide: true, stdio: 'ignore',
});
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
let browser, socket;
const pending = new Map();
let nextId = 0;
const errors = [];
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++nextId;
  const timer = setTimeout(() => { pending.delete(id); reject(new Error('Browser command timed out: ' + method)); }, 20000);
  pending.set(id, { resolve: value => { clearTimeout(timer); resolve(value); }, reject: error => { clearTimeout(timer); reject(error); } });
  socket.send(JSON.stringify({ id, method, params }));
});
async function evaluate(expression) {
  const response = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description || 'Browser evaluation failed');
  return response.result?.value;
}
async function waitFor(expression) {
  for (let index = 0; index < 100; index++) { if (await evaluate('Boolean(document.body && (' + expression + '))')) return; await pause(150); }
  throw new Error('Page did not reach expected state: ' + expression);
}
async function screenshot(name) {
  await evaluate('Promise.race([Promise.all([...document.images].map(image => image.decode().catch(() => {}))), new Promise(resolve => setTimeout(resolve, 5000))])');
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  await writeFile(path.join(artifacts, name), Buffer.from(shot.data, 'base64'));
}
try {
  for (let index=0; index<80; index++) {
    try { if ((await fetch(base+'/api/admin/session')).ok) break; } catch {}
    await pause(250);
  }
  const login=await fetch(base+'/api/admin/session',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({email,password})});
  assert.equal(login.status,200);
  const cookie=login.headers.get('set-cookie').split(';')[0];
  browser=spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',['--headless','--disable-gpu','--no-first-run','--remote-debugging-port=9788','--user-data-dir='+path.join(artifacts,'admin-confirm-browser'),'about:blank'],{windowsHide:true,stdio:'ignore'});
  let target;
  for(let index=0;index<80;index++) {
    try { target=(await fetch('http://127.0.0.1:9788/json/list').then(r=>r.json())).find(t=>t.type==='page'); if(target)break; }catch{}
    await pause(250);
  }
  assert.ok(target,'Browser available');
  socket=new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
  socket.addEventListener('message',event=>{
    const message=JSON.parse(event.data);
    if(message.id && pending.has(message.id)) {
      const callback=pending.get(message.id);pending.delete(message.id);
      if(message.error)callback.reject(new Error(message.error.message));else callback.resolve(message.result);
    }
    if(message.method==='Runtime.exceptionThrown')errors.push(message.params.exceptionDetails.exception?.description || 'Browser exception');
  });
  await send('Page.enable');await send('Runtime.enable');await send('Network.enable');
  const separator=cookie.indexOf('=');
  await send('Network.setCookie',{name:cookie.slice(0,separator),value:cookie.slice(separator+1),url:base,httpOnly:true,sameSite:'Strict'});
  // All changes are intercepted in the browser. This server has no database URI.
  await send('Page.addScriptToEvaluateOnNewDocument',{source:`
    window.reviewWrites=[];
    const originalFetch=window.fetch.bind(window);
    const categories=[{id:'labels',name:'Labels',active:true},{id:'shredded-paper',name:'Shredded Paper',active:false}];
    const product={id:'review-label',slug:'review-label',name:'Review Label',category:'labels',active:true,categoryActive:true,inStock:true,basePrice:10,bulkPrice:10,image:'/images/product-image-under-review.svg',pricing:[{minQty:1,maxQty:null,pricePerUnit:10,label:'Standard'}],sizes:[{label:'Standard',value:'standard',dimensions:'Standard'}]};
    window.fetch=async(input,options={})=>{
      const url=new URL(typeof input==='string'?input:input.url,location.href);
      const method=options.method || 'GET';
      const reply=data=>Promise.resolve(new Response(JSON.stringify(data),{status:200,headers:{'Content-Type':'application/json'}}));
      if(url.pathname.startsWith('/api/') && !['GET','HEAD'].includes(method)) {
        window.reviewWrites.push({path:url.pathname,method,body:options.body});
        return reply(options.body?JSON.parse(options.body):{});
      }
      if(url.pathname==='/api/admin/categories')return reply({editingEnabled:true,categories:categories.map(c=>({...c,productCount:1}))});
      if(url.pathname==='/api/admin/product-visibility')return reply({editingEnabled:true,categories,products:[product]});
      if(url.pathname==='/api/products')return reply([product]);
      if(url.pathname==='/api/admin/price-book') {
        const result=await originalFetch(input,options);const book=await result.json();book.editingEnabled=true;return reply(book);
      }
      if(url.pathname==='/api/admin/supplier-catalogue')return reply({editingEnabled:true,products:[{id:'supplier-review',title:'Review supplier',options:[],images:[],referenceImages:[],variants:[{id:'variant-review',title:'Standard pack',price:10,available:true,storeAvailable:true}]}],variantCount:1,sitemapProductCount:1,missingFromFeed:[],feedExhausted:true,fetchedAt:'2026-10-16T00:00:00Z'});
      return originalFetch(input,options);
    };
  `});
  const navigate=async route=>{await send('Page.navigate',{url:base+route});};
  const click=async text=>evaluate(`(() => {const button=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===${JSON.stringify(text)});if(!button)throw Error('Missing button');button.click();})()`);
  const popup=()=>waitFor('document.querySelector("dialog[open]")');
  const cancel=async()=>{await evaluate('document.querySelector("dialog[open] button").click()');await waitFor('!document.querySelector("dialog[open]")');assert.equal(await evaluate('reviewWrites.length'),0);};
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await navigate('/admin/categories');await waitFor('document.body.textContent.includes("Deactivate")');
  await click('Deactivate');await popup();
  assert.ok(await evaluate('document.querySelector("dialog[open]").textContent.includes("Labels")'));
  assert.equal(await evaluate('document.activeElement.textContent'),'Cancel');
  await cancel();
  await click('Activate');await popup();
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  await waitFor('!document.querySelector("dialog[open]")');
  assert.equal(await evaluate('reviewWrites.length'),0);
  await click('Deactivate');await popup();await click('Deactivate category');
  await waitFor('reviewWrites.length===1');
  assert.equal(await evaluate('JSON.parse(reviewWrites[0].body).active'),false);
  await navigate('/admin/product-visibility');await waitFor('document.body.textContent.includes("Review Label")');
  await click('Deactivate');await popup();await cancel();
  await click('Deactivate');await popup();await click('Deactivate product');await waitFor('reviewWrites.length===1');
  assert.equal(await evaluate('JSON.parse(reviewWrites[0].body).productId'),'review-label');
  const stockSelector=JSON.stringify('button[aria-label="Toggle status for Review Label"]');
  await navigate('/admin/products');await waitFor(`document.querySelector(${stockSelector})`);
  await evaluate(`document.querySelector(${stockSelector}).click()`);await popup();await cancel();
  await evaluate(`document.querySelector(${JSON.stringify('button[title="Edit Product"]')}).click()`);
  await waitFor('document.querySelector("#edit-product-form")');
  await evaluate('document.querySelector("#edit-product-form").requestSubmit()');await popup();
  await cancel();assert.ok(await evaluate('Boolean(document.querySelector("#edit-product-form"))'));
  await evaluate('document.querySelector("#edit-product-form").requestSubmit()');await popup();
  await click('Save changes');await waitFor('reviewWrites.length===1');
  await navigate('/admin/suppliers');await waitFor('document.body.textContent.includes("Review supplier")');
  await click('Refresh supplier prices & stock');await popup();await cancel();
  await click('Review variants');await waitFor('document.querySelector("article form")');
  await evaluate('document.querySelector("article form").requestSubmit()');await popup();await cancel();
  await navigate('/admin/price-book');await waitFor('document.body.textContent.includes("Cost & price")');
  await click('Cost & price');await waitFor('document.querySelector("[aria-labelledby=cost-title]")');
  await click('Close');await popup();
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  await waitFor('!document.querySelector("dialog[open]")');
  assert.ok(await evaluate('Boolean(document.querySelector("[aria-labelledby=cost-title]"))'));
  await click('Save private costing');await popup();await cancel();
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await click('Close');await popup();
  assert.ok(await evaluate('document.querySelector("dialog[open]").getBoundingClientRect().width <= innerWidth'));
  await screenshot('admin-confirmation-mobile.png');
  await click('Discard changes');await waitFor('!document.querySelector("[aria-labelledby=cost-title]")');
  assert.deepEqual(errors,[]);
  console.log('Admin confirmation review passed: confirm/cancel, Escape, nested editing, stock, supplier refresh, variant saves, costing and mobile layout. No database writes.');
} finally {
  if(socket?.readyState===WebSocket.OPEN){try{await send('Browser.close');}catch{}socket.close();}
  if(browser && browser.exitCode===null)browser.kill();
  if(server.exitCode===null)server.kill();
}
