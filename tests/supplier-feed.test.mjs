import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchSupplierSnapshot, snapshotChanges } from '../src/lib/supplier-feed.js';
import { productVisual, storefrontImage } from '../src/lib/product-visuals.js';
const origin='https://www.ecosoftindia.in';
const product={id:1,title:'White Courier Bag with Pocket',handle:'white-bag',options:[{name:'Size',values:['6x8']}],variants:[{id:11,price:'249.00',available:true,option1:'6x8'}],images:[]};
function fixture(first=[product], sitemap='white-bag') {
  return async url => {
    if(url.includes('page=1')) return Response.json({products:first});
    if(url.includes('page=')) return Response.json({products:[]});
    if(url.endsWith('/sitemap.xml')) return new Response(`<sitemapindex><loc>${origin}/sitemap_products_1.xml</loc></sitemapindex>`);
    return new Response(`<urlset><loc>${origin}/products/${sitemap}</loc></urlset>`);
  };
}
test('Refresh exhausts pagination and reconciles the sitemap before publishing',async()=>{
  const result=await fetchSupplierSnapshot(fixture());
  assert.equal(result.productCount,1);assert.equal(result.variantCount,1);assert.equal(result.feedExhausted,true);assert.equal(result.products[0].variants[0].price,'249.00');
});
test('Refresh rejects repeated products, invalid variants, partial feeds and HTTP failures',async()=>{
  await assert.rejects(fetchSupplierSnapshot(fixture([product,product])),/repeated/);
  await assert.rejects(fetchSupplierSnapshot(fixture([{...product,variants:[{...product.variants[0],price:'invalid'}]}])),/variant/);
  await assert.rejects(fetchSupplierSnapshot(fixture([product],'missing')),/reconcile/);
  await assert.rejects(fetchSupplierSnapshot(async()=>new Response('',{status:503})),/HTTP 503/);
  await assert.rejects(fetchSupplierSnapshot(fixture([])),/pagination/);
});
test('Refresh change report tracks exact variant IDs and never converts pack pricing',()=>{
  const before={products:[product]};
  const after={products:[{...product,variants:[{...product.variants[0],price:'399',available:false},{id:12,price:'99',available:true}]}]};
  assert.deepEqual(snapshotChanges(before,after),{addedVariants:1,removedVariants:0,priceChanges:1,stockChanges:1});
});
test('Visual mapping distinguishes transparent, opaque, pocket and coloured product families',()=>{
  assert.equal(productVisual('Meesho non transparent POD with pocket'),'/images/catalogue/mailer-white-pocket.webp');
  assert.equal(productVisual('Meesho transparent without pocket'),'/images/catalogue/mailer-clear.webp');
  assert.equal(productVisual('Brown Plain Courier Bag with Pocket'),'/images/catalogue/mailer-kraft-pocket.webp');
  assert.equal(productVisual('LIGHT GREEN PAPER SHREDDED'),'/images/catalogue/shred-light-green.webp');
  assert.equal(storefrontImage({name:'Brown Tape',image:'/images/product-brown-tape.jpg'}),'/images/catalogue/tape-brown.webp');
  assert.equal(storefrontImage({name:'Brown Tape',image:'/images/my-original-upload.webp'}),'/images/my-original-upload.webp');
});
