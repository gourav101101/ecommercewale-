import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { matchesDemo } from '../scripts/remove-demo-data.mjs';
import { products, categories } from '../src/data/products.js';
import { princeProducts } from '../src/data/prince-products.js';

const manifest=JSON.parse(readFileSync(new URL('../scripts/demo-data-manifest.json',import.meta.url),'utf8'));

test('Only unchanged demo fingerprints qualify for deletion',()=>{
  for(const samples of Object.values(manifest)) for(const sample of samples) {
    assert.equal(matchesDemo({...sample,_id:'stored-id'},sample),true);
    assert.equal(matchesDemo({...sample,id:'real-record'},sample),false);
  }
  const order=manifest.orders[0];
  assert.equal(matchesDemo({...order,total:order.total+1},order),false);
  const product=manifest.products[0];
  assert.equal(matchesDemo({...product,description:'Updated real product'},product),false);
});

test('Demo catalogue is empty and supplier products and categories remain',()=>{
  assert.deepEqual(products,[]);
  assert.equal(princeProducts.length,4);
  assert.ok(categories.some(category=>category.id==='printers'));
  assert.ok(!manifest.products.some(sample=>princeProducts.some(product=>matchesDemo(product,sample))));
});
