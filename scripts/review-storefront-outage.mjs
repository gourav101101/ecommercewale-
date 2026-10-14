import {spawn} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {excludedFromStorefront} from '../src/lib/storefront-policy.js';

// Deliberately unreachable, isolated database. Never changes a store database.
const base='http://localhost:3017';
const email='outage@example.invalid',password=randomBytes(24).toString('hex');
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','localhost','--port','3017'],{
  windowsHide:true,stdio:'pipe',env:{...process.env,MONGODB_URI:`mongodb://127.0.0.1:1/outage_${randomBytes(6).toString('hex')}`,ADMIN_EMAIL:email,ADMIN_PASSWORD:password,ADMIN_SESSION_SECRET:randomBytes(32).toString('hex')},
});
let logs='';server.stdout.on('data',chunk=>{logs+=chunk;});server.stderr.on('data',chunk=>{logs+=chunk;});
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
try {
  let ready=false;for(let i=0;i<80;i++){try{if((await fetch(base+'/api/admin/session')).ok){ready=true;break;}}catch{}await pause(200);}assert.ok(ready);
  await Promise.all(['', 'courier-bags','boxes','tapes','labels','shredded-paper'].map(async category=>{
    const response=await fetch(base+'/shop'+(category?'?category='+category:''));
    const html=await response.text();assert.equal(response.status,200,category);assert.ok(html.includes('Live prices and availability are temporarily unavailable'));
  }));
  const source=JSON.parse(await readFile('research/ecosoft-full-catalogue.json','utf8'));
  for(const slug of ['brown-plain-tamper-proof-courier-bag-with-pocket',source.products.find(p=>!excludedFromStorefront(p)).handle]) {
    const response=await fetch(base+'/product/'+slug);assert.equal(response.status,200);assert.ok((await response.text()).includes('Live prices and availability are temporarily unavailable'));
    const detail=await fetch(base+'/api/products/'+slug).then(r=>r.json());assert.equal(detail.product.catalogueUnavailable,true);assert.equal(detail.product.inStock,false);assert.ok(detail.product.variants.every(v=>v.available===false));
    assert.ok(!JSON.stringify(detail).includes('purchaseCost'));
  }
  assert.equal((await fetch(base+'/product/tape-dispanser')).status,404);
  assert.equal((await fetch(base+'/api/admin/database-health')).status,401);
  const login=await fetch(base+'/api/admin/session',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({email,password})});assert.equal(login.status,200);
  const cookie=login.headers.get('set-cookie').split(';')[0];
  const health=await fetch(base+'/api/admin/database-health',{headers:{Cookie:cookie}});assert.equal(health.status,503);assert.equal((await health.json()).connected,false);
  const failedSave=await fetch(base+'/api/admin/price-book',{method:'PUT',headers:{Cookie:cookie,Origin:base,'Content-Type':'application/json'},body:'{}'});assert.notEqual(failedSave.status,200);
  assert.ok(logs.includes('storefront_catalogue_unavailable'));
  console.log('Outage checks passed: all five categories, shop and product pages return 200; reference-only variants cannot be ordered; diagnostics require admin; failed writes remain failures.');
} finally {server.kill();}
