export function productIsActive(product, settings) {
  // null means the database read failed; do not republish hidden products.
  if (!settings) return false;
  return settings.find(item => item.productId === product.id)?.active !== false;
}

export function visibleProducts(products, settings) {
  return products.filter(product => productIsActive(product, settings));
}

export function validateProductVisibility(data, products) {
  if (!products.some(product => product.id === data?.productId) || typeof data?.active !== 'boolean') {
    throw new Error('Choose a valid product and active status.');
  }
  return { productId: data.productId, active: data.active };
}
