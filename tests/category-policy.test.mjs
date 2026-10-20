import test from 'node:test';
import assert from 'node:assert/strict';
import { categories } from '../src/data/products.js';
import { categoryStates, activeCategoryProducts } from '../src/lib/category-policy.js';

test('Shredded paper defaults inactive and its products are hidden without deletion', () => {
  const products = [{ id: 'paper', category: 'shredded-paper' }, { id: 'printer', category: 'printers' }];
  assert.deepEqual(activeCategoryProducts(products, categoryStates(categories)), [products[1]]);
  assert.equal(products.length, 2);
});

test('Persisted switches override defaults and allow reversible category activation', () => {
  const states = categoryStates(categories, [{ categoryId: 'shredded-paper', active: true }, { categoryId: 'labels', active: false }]);
  const products = [{ category: 'shredded-paper' }, { category: 'labels' }];
  assert.deepEqual(activeCategoryProducts(products, states), [products[0]]);
  assert.deepEqual(activeCategoryProducts(products, []), []);
  assert.equal(categoryStates(categories).find(item => item.id === 'shredded-paper').active, false);
});
