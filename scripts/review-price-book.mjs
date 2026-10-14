import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdir,writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { initialPriceSettings } from '../src/lib/price-book.js';

const artifacts=path.resolve('test-artifacts');await mkdir(artifacts,{recursive:true});
const db=await MongoMemoryServer.create();
const uri=db.getUri('pricebook_review'),base='http://localhost:3016';
const email='pricebook@example.invalid',password=randomBytes(24).toString('hex');
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','localhost','--port','3016'],{windowsHide:true,stdio:'ignore',env:{...process.env,MONGODB_URI:uri,ADMIN_EMAIL:email,ADMIN_PASSWORD:password,ADMIN_SESSION_SECRET:randomBytes(32).toString('hex')}});
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let browser,socket;
try {
  let ready=false;for(let i=0;i<100;i++){try{if((await fetch(base+'/api/admin/session')).ok){ready=true;break;}}catch{}await pause(200);}assert.ok(ready);
  assert.equal((await fetch(base+'/api/admin/price-book')).status,401);
  assert.equal((await fetch(base+'/api/admin/price-book?format=csv')).status,401);
  const login=await fetch(base+'/api/admin/session',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({email,password})});assert.equal(login.status,200);
  const cookie=login.headers.get('set-cookie').split(';')[0],headers={Cookie:cookie,Origin:base,'Content-Type':'application/json'};
  let book=await fetch(base+'/api/admin/price-book',{headers}).then(r=>r.json());
  assert.equal(book.items.length,171);assert.equal(book.editingEnabled,true);assert.equal(book.records.length,0);
  const item=book.items.find(i=>i.id==='eco-meesho-transparent-pod-8x10');
  const settings=initialPriceSettings(item);
  const put=body=>fetch(base+'/api/admin/price-book',{method:'PUT',headers,body:JSON.stringify(body)});
  assert.equal((await fetch(base+'/api/admin/price-book',{method:'PUT',headers:{...headers,Origin:'https://invalid.example'},body:'{}'})).status,403);
  assert.equal((await put({itemId:item.id,revision:0,settings:{...settings,inboundFreight:-1}})).status,400);
  let response=await put({itemId:item.id,revision:0,settings});assert.equal(response.status,200);
  let record=(await response.json()).record;assert.equal(record.revision,1);
  const apply=()=>fetch(base+'/api/admin/price-book',{method:'POST',headers,body:JSON.stringify({itemId:item.id,revision:record.revision})});
  assert.equal((await apply()).status,400);
  assert.equal((await put({itemId:item.id,revision:0,settings})).status,409);
  const catalogue=await fetch(base+'/api/admin/supplier-catalogue',{headers}).then(r=>r.json());
  // Disposable mapping verifies exact-variant behavior, never changes the user's database.
  const product=catalogue.products.find(p=>!p.storefrontExcluded&&p.variants.some(v=>v.isCourierBag));
  const variant=product.variants[0];
  const complete={...settings,quantity:500,tierQuantity:500,packQuantity:100,inboundFreight:100,handlingPerBag:.1,outboundPerPack:20,feePercent:2,targetMargin:25,gstRate:18,gstHsn:'3923',purchaseGst:'recoverable',supplierConfirmed:true,productId:String(product.id),variantId:String(variant.id),matchConfirmed:true};
  response=await put({itemId:item.id,revision:1,settings:complete});assert.equal(response.status,200);record=(await response.json()).record;
  assert.equal((await put({itemId:item.id,revision:1,settings:complete})).status,409);
  await mongoose.connect(uri);
  await mongoose.connection.collection('suppliervariantoverrides').insertOne({productId:String(product.id),variantId:String(variant.id),available:false,sellingPrice:999,commercial:{stockQuantity:7,stockVerifiedAt:new Date(),confirmed:true}});
  response=await apply();assert.equal(response.status,200,await response.text());
  const stored=await mongoose.connection.collection('suppliervariantoverrides').findOne({variantId:String(variant.id)});
  assert.equal(stored.sellingPrice,422);assert.equal(stored.commercial.purchaseCost,258);assert.equal(stored.commercial.stockQuantity,7);assert.equal(stored.available,false);assert.equal(stored.commercial.confirmed,false);assert.equal(stored.packQuantity,100);
  assert.equal(await mongoose.connection.collection('suppliervariantoverrides').countDocuments(),1);
  book=await fetch(base+'/api/admin/price-book',{headers}).then(r=>r.json());assert.equal(book.records[0].revision,2);
  const csv=await fetch(base+'/api/admin/price-book?format=csv',{headers});assert.equal(csv.status,200);assert.equal((await csv.text()).split('\r\n').length,426);
  const publicDetail=await fetch(base+'/api/products/'+product.slug).then(r=>r.text());assert.ok(!publicDetail.includes('purchaseCost'));assert.ok(!publicDetail.includes('targetMargin'));
  console.log('Price book: auth, CSRF, persistence, stale revisions, validation, exact pack application, stock preservation, CSV and cost privacy passed.');

  if(process.argv.includes('--browser')) {
    browser=spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',['--headless','--disable-gpu','--no-first-run','--remote-debugging-port=9778','--user-data-dir='+path.join(artifacts,'pricebook-browser'),'about:blank'],{windowsHide:true,stdio:'ignore'});
    let target;for(let i=0;i<80;i++){try{target=(await fetch('http://127.0.0.1:9778/json/list').then(r=>r.json())).find(t=>t.type==='page');if(target)break;}catch{}await pause(250);}assert.ok(target);
    socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise(resolve=>socket.addEventListener('open',resolve,{once:true}));
    const pending=new Map();let id=0;const errors=[];
    socket.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id&&pending.has(m.id)){pending.get(m.id)(m.result);pending.delete(m.id);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);});
    const send=(method,params={})=>new Promise(resolve=>{pending.set(++id,resolve);socket.send(JSON.stringify({id,method,params}));});
    const evaluate=async expression=>(await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true})).result?.value;
    async function waitFor(expression){for(let i=0;i<100;i++){if(await evaluate(expression))return;await pause(150);}throw new Error('Browser wait: '+expression);}
    async function shot(name){const image=await send('Page.captureScreenshot',{format:'png'});await writeFile(path.join(artifacts,name),Buffer.from(image.data,'base64'));}
    await send('Page.enable');await send('Runtime.enable');await send('Network.enable');
    const sep=cookie.indexOf('=');await send('Network.setCookie',{name:cookie.slice(0,sep),value:cookie.slice(sep+1),url:base,httpOnly:true,sameSite:'Strict'});
    await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1050,deviceScaleFactor:1,mobile:false});
    await send('Page.navigate',{url:base+'/admin/price-book'});await waitFor('document.querySelectorAll("tbody tr").length===171');await shot('price-book-desktop.png');
    await evaluate('document.querySelector("tbody button").click()');await waitFor('!!document.querySelector("[role=dialog]")');
    assert.equal(await evaluate('document.querySelector("[role=dialog]").contains(document.activeElement)'),true);await shot('price-book-editor.png');
    await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await shot('price-book-mobile.png');
    assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'),true);assert.deepEqual(errors,[]);
    console.log('Desktop/mobile browser review passed. Screenshots in test-artifacts.');
  }
} finally {socket?.close();browser?.kill();server.kill();await mongoose.disconnect();await db.stop();}
