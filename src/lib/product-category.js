// Read existing stored categories without requiring a destructive DB migration.
export function canonicalCategory(category, product = {}) {
  if (category === 'boxes-tapes') {
    return /tape/i.test(`${product.name || product.title || ''} ${product.type || ''} ${product.slug || product.handle || ''}`) ? 'tapes' : 'boxes';
  }
  return category === 'labels-stickers' ? 'labels' : category;
}

export function canonicalProductCategory(product) {
  return { ...product, category: canonicalCategory(product.category, product) };
}
