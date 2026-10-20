import test from 'node:test';
import assert from 'node:assert/strict';
import { visibleProducts, validateProductVisibility } from '../src/lib/product-visibility-policy.js';
import { activeCategoryProducts } from '../src/lib/category-policy.js';

const products = [{ id: 'supplier-a', category: 'labels' }, { id: 'custom-b', category: 'labels' }, { id: 'paper', category: 'shredded-paper' }];
test('Per-product settings are reversible and never delete or alter stock records', () => {
  assert.deepEqual(visibleProducts(products, []), products);
  assert.deepEqual(visibleProducts(products, [{ productId: 'supplier-a', active: false }]), products.slice(1));
  assert.deepEqual(visibleProducts(products, [{ productId: 'supplier-a', active: true }]), products);
  assert.equal(products.length, 3);
});
test('Inactive category wins over active product and failed settings reads stay hidden', () => {
  const categories = [{ id: 'labels', active: true }, { id: 'shredded-paper', active: false }];
  assert.deepEqual(visibleProducts(activeCategoryProducts(products, categories), [{ productId: 'paper', active: true }, { productId: 'custom-b', active: false }]), [products[0]]);
  assert.deepEqual(visibleProducts(products, null), []);
});
test('Writes require an existing product and a strict boolean', () => {
  assert.deepEqual(validateProductVisibility({ productId: 'supplier-a', active: false }, products), { productId: 'supplier-a', active: false });
  for (const input of [null, {}, { productId: 'missing', active: false }, { productId: 'supplier-a', active: 'false' }]) {
    assert.throws(() => validateProductVisibility(input, products));
  }
});
