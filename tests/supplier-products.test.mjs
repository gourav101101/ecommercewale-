import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { buildSupplierProducts, variantCartItem, variantOrderable, validateVariantOverride } from '../src/lib/supplier-products.js';
import { orderMessage } from '../src/lib/whatsapp.js';
const source=JSON.parse(readFileSync(new URL('../research/ecosoft-full-catalogue.json',import.meta.url),'utf8'));
const products=buildSupplierProducts(source);
const brown=products.find(item=>item.slug==='brown-plain-tamper-proof-courier-bag-with-pocket');

test('Every supplier product and variant uses an existing original local image',()=>{
  const provenance=JSON.parse(readFileSync(new URL('../research/generated-image-provenance.json',import.meta.url),'utf8'));
  assert.equal(provenance.length,32);
  for(const product of products){
    assert.match(product.image,/^\/images\/catalogue\/[a-z-]+\.webp$/);
    assert.ok(existsSync(new URL('../public'+product.image,import.meta.url)));
    assert.ok(product.visualDisclosure.includes('AI-created'));
    assert.ok(product.features.length>=3);
    for(const variant of product.variants)assert.equal(variant.image,product.image);
  }
});

test('All 44 supplier products and 688 variants retain exact source prices and option combinations',()=>{
  assert.equal(products.length,44);
  assert.equal(products.reduce((sum,item)=>sum+item.variants.length,0),688);
  assert.equal(new Set(products.map(item=>item.slug)).size,44);
  for(const product of products){
    const original=source.products.find(item=>String(item.supplierId)===product.supplierId);
    assert.equal(product.variants.length,original.variants.length);
    for(const variant of product.variants){
      const raw=original.variants.find(item=>String(item.id)===variant.id);
      assert.equal(variant.price,Number(raw.price));
      assert.equal(variant.available,raw.available&&Number(raw.price)>0);
      assert.equal(variant.values.length,product.options.length);
      assert.ok(!variant.title.includes('Free Delivery'));
    }
    assert.ok(!product.name.includes('100% barcode'));
  }
});
test('Size and pack choose distinct prices without guessing per-piece conversions',()=>{
  assert.equal(brown.variants.find(item=>item.title==='6x8 / 100').price,249);
  assert.equal(brown.variants.find(item=>item.title==='8x10 / 100').price,399);
  assert.equal(brown.variants.find(item=>item.title==='8x10 / 500').price,1799);
  const first=brown.variants[0];
  const cart=variantCartItem(brown,first.id,2);
  assert.equal(cart.pricePerUnit,249);assert.equal(cart.quantity*cart.pricePerUnit,498);
  assert.equal(cart.variantId,first.id);assert.equal(cart.priceUnit,'pack/item');
  const text=orderMessage([cart],{name:'Seller',phone:'9827787080',pincode:'452015'},498);
  for(const phrase of ['6x8 / 100',first.id,'2 selected packs/items','not individual pieces','₹498.00']) assert.ok(text.includes(phrase),phrase);
});
test('Unavailable and zero-price variants cannot enter the cart',()=>{
  let blocked=0;
  for(const product of products)for(const variant of product.variants)if(!variantOrderable(variant)){assert.equal(variantCartItem(product,variant.id,1),null);blocked++;}
  assert.ok(blocked>0);
  for(const count of [0,-1,1.5,Infinity,1000000])assert.equal(variantCartItem(brown,brown.variants[0].id,count),null);
  assert.equal(variantCartItem(brown,'missing',1),null);
});
test('Admin override changes one exact variant and preserves the supplier reference',()=>{
  const id=brown.variants[0].id;
  const data=validateVariantOverride({productId:brown.supplierId,variantId:id,sellingPrice:299,available:true},source);
  const updated=buildSupplierProducts(source,[data]).find(item=>item.id===brown.id);
  assert.equal(updated.variants[0].price,299);assert.equal(updated.variants[0].sourcePrice,249);
  assert.equal(updated.variants[1].price,brown.variants[1].price);
  assert.equal(buildSupplierProducts(source,[{...data,available:false}]).find(item=>item.id===brown.id).variants[0].available,false);
  for(const sellingPrice of [-1,0,NaN,Infinity,12.345])assert.throws(()=>validateVariantOverride({...data,sellingPrice},source));
  assert.throws(()=>validateVariantOverride({...data,variantId:'missing'},source));
  assert.equal(validateVariantOverride({...data,sellingPrice:null},source).sellingPrice,null);
});
