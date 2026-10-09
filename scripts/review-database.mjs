import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose from 'mongoose';
import {spawn} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

// Uses a disposable real MongoDB process; never accepts a production URI.
const artifacts=path.resolve('test-artifacts');
await mkdir(artifacts,{recursive:true});
const database=await MongoMemoryServer.create({binary:{downloadDir:path.join(artifacts,'mongodb-binary')},instance:{ip:'127.0.0.1'}});
const uri=database.getUri('ecommercewale_integration');
const base='http://localhost:3013';
const email='integration@example.invalid',password=randomBytes(24).toString('hex');
const cronSecret=randomBytes(32).toString('hex');
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','localhost','--port','3013'],{windowsHide:true,stdio:'ignore',env:{...process.env,MONGODB_URI:uri,ADMIN_EMAIL:email,ADMIN_PASSWORD:password,ADMIN_SESSION_SECRET:randomBytes(32).toString('hex'),CRON_SECRET:cronSecret}});
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
try {
  let ready=false;
  for(let i=0;i<100;i++){try{if((await fetch(base+'/api/admin/session')).ok){ready=true;break;}}catch{}await pause(200);}
  assert.ok(ready,'Isolated server must start');
  assert.equal((await fetch(base+'/api/admin/supplier-refresh',{method:'POST'})).status,401);
  assert.equal((await fetch(base+'/api/cron/supplier-refresh')).status,401);
  assert.equal((await fetch(base+'/api/cron/supplier-refresh',{headers:{authorization:'Bearer '+ 'é'.repeat(64)}})).status,401);
  const login=await fetch(base+'/api/admin/session',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({email,password})});
  assert.equal(login.status,200);
  const cookie=login.headers.get('set-cookie').split(';')[0];
  const headers={Cookie:cookie,Origin:base,'Content-Type':'application/json'};
  const review=await fetch(base+'/api/admin/supplier-catalogue',{headers}).then(r=>r.json());
  assert.equal(review.editingEnabled,true);
  const product=review.products.find(p=>p.slug==='brown-plain-tamper-proof-courier-bag-with-pocket');
  const variant=product.variants[0];
  const payload={productId:product.id,variantId:variant.id,sellingPrice:299,available:true};
  const save=await fetch(base+'/api/admin/supplier-catalogue',{method:'PATCH',headers,body:JSON.stringify(payload)});
  assert.equal(save.status,200);
  await mongoose.connect(uri);
  const persisted=await mongoose.connection.collection('suppliervariantoverrides').findOne({variantId:String(variant.id)});
  assert.equal(persisted.sellingPrice,299);
  let detail=await fetch(base+'/api/products/'+product.slug).then(r=>r.json());
  assert.equal(detail.product.variants[0].price,299);
  assert.equal(detail.product.variants[0].sourcePrice,249);
  assert.equal(detail.product.variants[1].price,Number(product.variants[1].price));
  const snapshot=JSON.parse(await readFile('research/ecosoft-full-catalogue.json','utf8'));
  snapshot.products.find(p=>String(p.supplierId)===String(product.id)).variants[0].price='279.00';
  await mongoose.connection.collection('suppliersnapshots').insertOne({key:'ecosoft',snapshot,checkedAt:new Date()});
  assert.equal((await fetch(base+'/api/admin/supplier-catalogue',{method:'PATCH',headers,body:JSON.stringify({...payload,sellingPrice:null,available:false})})).status,200);
  detail=await fetch(base+'/api/products/'+product.slug).then(r=>r.json());
  assert.equal(detail.product.variants[0].price,279);
  assert.equal(detail.product.variants[0].available,false);
  assert.equal(await mongoose.connection.collection('suppliervariantoverrides').countDocuments({}),1);
  await writeFile(path.join(artifacts,'database-review.json'),JSON.stringify({passed:true,environment:'Disposable real MongoDB, no production data touched',checks:['authenticated save persisted','storefront reflects exact override','source reference retained','unrelated variants unchanged','saved refreshed snapshot used','clear override uses current source price','availability override persists','cron rejects missing and malformed secrets']},null,2));
  console.log('Real MongoDB integration checks passed (disposable database).');
} finally {server.kill();await mongoose.disconnect();await database.stop();}
