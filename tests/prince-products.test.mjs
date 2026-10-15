import test from 'node:test';
import assert from 'node:assert/strict';
import { princeProducts } from '../src/data/prince-products.js';
import { variantCartItem } from '../src/lib/supplier-products.js';
import { referenceOnlyProduct } from '../src/lib/catalogue-resilience.js';

test('Prince roll quantities and reference prices retain the supplier units', () => {
  const [shipping, barcode] = princeProducts;
  assert.deepEqual(shipping.variants.map(v => [v.price,v.labelsPerRoll,v.rollsPerBox]), [[155,400,40],[135,500,40]]);
  assert.equal(barcode.variants.length,26);
  assert.equal(new Set(princeProducts.flatMap(p=>p.variants.map(v=>v.id))).size,29);
  const roll=barcode.variants.find(v=>v.id==='prince-barcode-38x25-2up');
  assert.equal(roll.price,122);
  assert.equal(roll.labelsPerRoll,4000);
  assert.ok(barcode.variants.every(v=>v.gstRate===18));
  assert.equal(variantCartItem(barcode,roll.id,2).pricePerUnit,122);
  assert.equal(variantCartItem(referenceOnlyProduct(barcode),roll.id,1),null);
});

test('Unconfirmed printer prices and warranties cannot become orderable offers', () => {
  const printer=princeProducts[2];
  assert.equal(printer.basePrice,0);
  assert.equal(variantCartItem(printer,printer.variants[0].id,1),null);
  assert.ok(!JSON.stringify(printer).includes('13000'));
  assert.ok(!printer.features.some(feature=>/months|dpi/.test(feature)));
});
