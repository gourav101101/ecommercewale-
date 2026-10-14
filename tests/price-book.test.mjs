import test from 'node:test';
import assert from 'node:assert/strict';
import { priceBookItems as items,priceBookGroups,priceBookSource } from '../src/data/ecosoft-price-book.js';
import { initialPriceSettings,validatePriceSettings,calculatePrice,priceBookCsv } from '../src/lib/price-book.js';
const item=items.find(i=>i.id==='eco-meesho-transparent-pod-8x10');
const complete=()=>({...initialPriceSettings(item),quantity:500,tierQuantity:500,packQuantity:100,inboundFreight:100,handlingPerBag:.1,outboundPerPack:20,feePercent:2,targetMargin:25,gstRate:18,gstHsn:'3923',purchaseGst:'recoverable',supplierConfirmed:true});
test('PDF transcription covers all families, distinct options and 425 quoted rates',()=>{
  assert.equal(priceBookGroups.length,12);assert.equal(items.length,171);
  assert.equal(new Set(items.map(i=>i.id)).size,171);
  assert.equal(items.reduce((s,i)=>s+i.tiers.length,0),425);
  assert.equal(priceBookSource.gstIncluded,false);assert.equal(priceBookSource.deliveryIncluded,false);
  for(const i of items)for(const t of i.tiers)assert.ok(t.unitCost>0 && Number.isFinite(t.unitCost));
  assert.deepEqual(item.tiers.map(t=>t.unitCost),[2.86,2.58,2.25,2.23]);
  assert.equal(items.filter(i=>i.groupId==='colour-pod').length,24);
  assert.ok(items.find(i=>i.id==='eco-meesho-opaque-pod-6x8').flags.some(f=>f.includes('NP1')));
});
test('Unknown charges stay incomplete; explicit zero is allowed',()=>{
  const preview=calculatePrice(item,initialPriceSettings(item));
  assert.equal(preview.ready,false);assert.equal(preview.packGst,null);
  assert.ok(preview.missing.includes('Inbound freight'));
  const settings={...complete(),inboundFreight:0,handlingPerBag:0,outboundPerPack:0,feePercent:0,gstRate:0};
  assert.equal(calculatePrice(item,settings).ready,true);
});
test('Purchase quantity, pack quantity, fees and margin use the correct units',()=>{
  const q=calculatePrice(item,complete());
  assert.equal(q.purchaseSubtotal,1290);assert.equal(q.purchaseGoodsGst,232.2);
  assert.ok(Math.abs(q.costPerBag-3.08)<1e-9);
  assert.equal(q.suggestedPerBag,4.22);assert.equal(q.packSubtotal,422);assert.equal(q.packGst,75.96);assert.equal(q.packTotal,497.96);
  assert.ok(q.margin>=25);assert.equal(q.ready,true);
  const nonRecoverable=calculatePrice(item,{...complete(),purchaseGst:'cost'});
  assert.ok(Math.abs(nonRecoverable.costPerBag-q.costPerBag-.4644)<1e-9);
});
test('No invented intermediate bulk tier, invalid money or impossible margins',()=>{
  for(const changes of [{quantity:499},{packQuantity:501},{feePercent:75},{quantity:0},{quantity:1.5},{inboundFreight:-1},{gstRate:NaN},{targetMargin:100},{costOverride:true},{handlingPerBag:.001},{gstHsn:'abc'}]) {
    assert.throws(()=>validatePriceSettings({...complete(),...changes},item));
  }
  const loss=calculatePrice(item,{...complete(),sellingPerBag:1});assert.equal(loss.ready,false);assert.ok(loss.profitPerBag<0);
});
test('Saved revisions do not rewrite the PDF and CSV neutralizes spreadsheet formulas',()=>{
  const s={...complete(),costOverride:2.5,notes:'=HYPERLINK("bad")'};
  assert.equal(calculatePrice(item,s).unitCost,2.5);assert.equal(item.tiers[1].unitCost,2.58);
  const csv=priceBookCsv([item],[{itemId:item.id,settings:s}]);
  assert.match(csv,/'=HYPERLINK/);assert.equal(csv.split('\r\n').length,5);
});
