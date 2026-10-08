import test from 'node:test';
import assert from 'node:assert/strict';
import { quantityPrice, validQuantity } from '../src/lib/catalogue-pricing.js';

test('Quick-shop pricing selects the correct quantity tier without mutating input', () => {
  const tiers = [{ minQty: 1, pricePerUnit: 8.5 }, { minQty: 100, pricePerUnit: 6.5 }, { minQty: 500, pricePerUnit: 5 }];
  const original = JSON.stringify(tiers);
  assert.equal(quantityPrice(tiers, 99), 8.5);
  assert.equal(quantityPrice(tiers, 100), 6.5);
  assert.equal(quantityPrice(tiers, 500), 5);
  assert.equal(quantityPrice(tiers, 10000), 5);
  assert.equal(JSON.stringify(tiers), original);
  assert.equal(quantityPrice([], 1), 0);
});

test('Quick-shop quantities reject invalid, fractional and excessively large values', () => {
  for (const value of [0, -1, '', 'abc', 1.2, Infinity, 1000000]) assert.equal(validQuantity(value), false);
  for (const value of [1, '100', 999999]) assert.equal(validQuantity(value), true);
});
