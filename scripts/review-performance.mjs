import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const base=process.env.REVIEW_URL || 'http://127.0.0.1:3001';
const artifacts=path.resolve('test-artifacts');
await mkdir(artifacts,{recursive:true});
const browser=spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',['--headless','--disable-gpu','--no-first-run','--remote-debugging-port=9667','--user-data-dir='+path.join(artifacts,'performance-browser'),'about:blank'],{windowsHide:true,stdio:'ignore'});
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let socket,id=0;
const pending=new Map();
function send(method,params={}){return new Promise((resolve,reject)=>{const requestId=++id;const timer=setTimeout(()=>reject(new Error('CDP timed out: '+method)),20000);pending.set(requestId,{resolve:value=>{clearTimeout(timer);resolve(value);},reject});socket.send(JSON.stringify({id:requestId,method,params}));});}
async function evaluate(expression){const value=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(value.exceptionDetails)throw new Error(value.exceptionDetails.text);return value.result.value;}
try {
  let target;
  for(let i=0;i<80;i++){try{target=(await fetch('http://127.0.0.1:9667/json/list').then(r=>r.json())).find(item=>item.type==='page');if(target)break;}catch{}await pause(200);}
  if(!target)throw new Error('Browser unavailable');
  socket=new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
  socket.addEventListener('message',event=>{const message=JSON.parse(event.data);if(message.id&&pending.has(message.id)){const callback=pending.get(message.id);pending.delete(message.id);message.error?callback.reject(new Error(message.error.message)):callback.resolve(message.result);}});
  await send('Page.enable');await send('Runtime.enable');await send('Network.enable');
  await send('Network.setCacheDisabled',{cacheDisabled:true});
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await send('Emulation.setCPUThrottlingRate',{rate:4});
  await send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:90000,connectionType:'cellular4g'});
  await send('Page.addScriptToEvaluateOnNewDocument',{source:`window.__measure={lcp:0,cls:0,longTaskBlocking:0};new PerformanceObserver(list=>{for(const e of list.getEntries())window.__measure.lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__measure.cls+=e.value;}).observe({type:'layout-shift',buffered:true});new PerformanceObserver(list=>{for(const e of list.getEntries())window.__measure.longTaskBlocking+=Math.max(0,e.duration-50);}).observe({type:'longtask',buffered:true});`});
  const routes=[];
  for(const route of ['/','/shop','/product/brown-plain-tamper-proof-courier-bag-with-pocket']) {
    await send('Network.clearBrowserCache');await send('Page.navigate',{url:base+route});
    await pause(12000);
    const result=await evaluate(`({route:location.pathname,...window.__measure,domContentLoaded:performance.getEntriesByType('navigation')[0]?.domContentLoadedEventEnd,load:performance.getEntriesByType('navigation')[0]?.loadEventEnd,transferredBytes:performance.getEntriesByType('navigation')[0]?.transferSize+performance.getEntriesByType('resource').reduce((sum,e)=>sum+e.transferSize,0),overflow:document.documentElement.scrollWidth>innerWidth+1,brokenImages:[...document.images].filter(i=>i.loading!=='lazy'&&i.complete&&!i.naturalWidth).length,externalProductPhotos:[...document.images].filter(i=>/cdn.shopify|unsplash/.test(decodeURIComponent(i.currentSrc))).length})`);
    if(result.route!==route||result.overflow||result.brokenImages||result.externalProductPhotos)throw new Error('Performance page health check failed: '+JSON.stringify(result));
    routes.push(result);console.log(JSON.stringify(result));
  }
  await writeFile(path.join(artifacts,'mobile-performance.json'),JSON.stringify({environment:'Local production build. Cold browser cache, 390px viewport, 4x CPU slowdown, 150ms latency, 1.6Mbps download. Diagnostic observations, not Lighthouse or production field Core Web Vitals.',routes},null,2));
} finally {socket?.close();browser.kill();}
