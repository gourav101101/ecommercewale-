import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePricing, formatPricing, productInput } from '../src/lib/product-input.js';
import { products } from '../src/data/products.js';

test('Editing preserves every existing catalogue pricing tier', () => {
  for (const product of products) {
    const pricing = parsePricing(formatPricing(product.pricing));
    assert.deepEqual(pricing, product.pricing);
    const validated = productInput({ ...product, pricing, basePrice: 9999, bulkPrice: 9999, bestSeller: !!product.bestSeller });
    assert.equal(validated.basePrice, product.pricing[0].pricePerUnit);
    assert.equal(validated.bulkPrice, Math.min(...product.pricing.map(tier => tier.pricePerUnit)));
    assert.ok(!('reviews' in validated));
  }
});
test('Pricing rejects gaps, overlaps, zero prices and missing final open range', () => {
  for (const value of ['1 | 99 | 8\n101 | | 6', '1 | 100 | 8\n100 | | 6', '1 | | 0', '2 | | 6', '1 | 20 | 6']) assert.throws(() => parsePricing(value));
});
test('Product input rejects duplicate sizes, unsafe identifiers and unsupported images', () => {
  const product = { ...products[0], bestSeller: true };
  assert.throws(() => productInput({ ...product, id: { $ne: '' } }));
  assert.throws(() => productInput({ ...product, image: 'javascript:alert(1)' }));
  assert.throws(() => productInput({ ...product, sizes: [product.sizes[0], product.sizes[0]] }));
});
