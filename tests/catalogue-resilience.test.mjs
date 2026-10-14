import test from 'node:test';
import assert from 'node:assert/strict';
import {databaseFailureCategory,referenceOnlyProduct,withCatalogueFallback} from '../src/lib/catalogue-resilience.js';
test('Healthy reads retain store prices and never use reference fallback',async()=>{
  const original={price:399,available:true};
  assert.equal(await withCatalogueFallback(async()=>original,()=>assert.fail()),original);
});
test('Database errors give reference browsing without logging raw connection secrets',async()=>{
  const events=[];
  const result=await withCatalogueFallback(()=>{throw new Error('querySrv ENOTFOUND secret-host');},()=>['reference'],{onFailure:e=>events.push(e)});
  assert.deepEqual(result,['reference']);assert.equal(events[0].category,'dns');assert.ok(!JSON.stringify(events).includes('secret-host'));
});
test('A slow database is bounded and the next successful read recovers immediately',async()=>{
  assert.equal(await withCatalogueFallback(()=>new Promise(()=>{}),()=> 'reference',{timeoutMs:10,onFailure:()=>{}}),'reference');
  assert.equal(await withCatalogueFallback(async()=> 'live',()=> 'reference'),'live');
});
test('Reference browsing cannot re-enable supplier availability or mutate source data',()=>{
  const source={inStock:true,variants:[{id:'x',price:10,available:true}]};
  const result=referenceOnlyProduct(source);
  assert.equal(result.inStock,false);assert.equal(result.variants[0].available,false);assert.equal(result.catalogueUnavailable,true);
  assert.equal(source.variants[0].available,true);assert.equal(source.inStock,true);
});
test('Unknown products preserve read failures rather than inventing a not-found response',async()=>{
  const error=new Error('unavailable');
  await assert.rejects(()=>withCatalogueFallback(()=>{throw error;},error=>{throw error;},{onFailure:()=>{}}),/unavailable/);
  assert.equal(databaseFailureCategory({code:18}),'authentication');
  assert.equal(databaseFailureCategory({name:'MongoServerSelectionError'}),'connectivity');
});
