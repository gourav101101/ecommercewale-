export function categoryStates(categories, overrides = []) {
  const saved = new Map(overrides.map(item => [item.categoryId, item.active]));
  return categories.map(category => ({ ...category, active: saved.get(category.id) ?? category.active ?? true }));
}

export function activeCategoryProducts(products, categories) {
  const active = new Set(categories.filter(item => item.active !== false).map(item => item.id));
  return products.filter(product => active.has(product.category));
}
