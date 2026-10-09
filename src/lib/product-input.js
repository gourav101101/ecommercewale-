import { canonicalCategory } from './product-category.js';

export function validatePricing(value) {
  if (!Array.isArray(value) || !value.length || value.length > 30) throw new Error('Add between 1 and 30 pricing tiers.');
  const tiers = value.map(tier => ({
    minQty: Number(tier.minQty), maxQty: tier.maxQty === null || tier.maxQty === '' ? null : Number(tier.maxQty),
    pricePerUnit: Number(tier.pricePerUnit), label: String(tier.label || '').trim().slice(0, 100),
  }));
  tiers.forEach((tier, index) => {
    if (!Number.isInteger(tier.minQty) || tier.minQty < 1 || !Number.isFinite(tier.pricePerUnit) || tier.pricePerUnit <= 0) throw new Error('Tier quantities must be positive whole numbers and prices must be greater than zero.');
    if (index === 0 && tier.minQty !== 1) throw new Error('The first pricing tier must start at 1 unit.');
    if (index < tiers.length - 1 && (!Number.isInteger(tier.maxQty) || tier.maxQty < tier.minQty || tier.maxQty + 1 !== tiers[index + 1].minQty)) throw new Error('Pricing tiers must be consecutive, without gaps or overlaps.');
    if (index === tiers.length - 1 && tier.maxQty !== null) throw new Error('Leave the last tier maximum blank for unlimited quantities.');
    if (!tier.label) tier.label = tier.maxQty === null ? `${tier.minQty}+ units` : `${tier.minQty}–${tier.maxQty} units`;
  });
  return tiers;
}

export function parsePricing(text) {
  return validatePricing(String(text).split('\n').filter(line => line.trim()).map(line => {
    const [minQty, maxQty, pricePerUnit, label = ''] = line.split('|').map(value => value.trim());
    if (pricePerUnit === undefined || pricePerUnit === '') throw new Error('Use: minimum | maximum | unit price | label for each pricing tier.');
    return { minQty, maxQty: maxQty || null, pricePerUnit, label };
  }));
}

export function formatPricing(pricing = []) {
  return pricing.map(tier => `${tier.minQty} | ${tier.maxQty ?? ''} | ${tier.pricePerUnit} | ${tier.label || ''}`).join('\n');
}

function text(value, name, max = 500, required = false) {
  if (typeof value !== 'string' || value.length > max || (required && !value.trim())) throw new Error(`Invalid ${name}.`);
  return value.trim();
}
function imagePath(value) {
  if (typeof value !== 'string' || value.length > 2000) throw new Error('Invalid image path.');
  if (/^\/images\/[a-zA-Z0-9/_ .-]+$/.test(value) && !value.includes('..')) return value;
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' && (url.hostname === 'images.unsplash.com' || (url.hostname === 'cdn.shopify.com' && url.pathname.startsWith('/s/files/1/0965/0018/7434/')))) return value;
  } catch { /* Use the actionable error below. */ }
  throw new Error('Use a local /images/ path or an approved supplier image URL.');
}
export function productInput(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid product.');
  data = { ...data, category: canonicalCategory(data.category, data) };
  for (const key of ['id', 'slug']) if (typeof data[key] !== 'string' || !/^[a-z0-9][a-z0-9-]{0,159}$/.test(data[key])) throw new Error(`Invalid product ${key}.`);
  if (!['courier-bags', 'boxes', 'tapes', 'labels', 'shredded-paper'].includes(data.category)) throw new Error('Choose a supported category.');
  if (typeof data.inStock !== 'boolean' || typeof data.bestSeller !== 'boolean') throw new Error('Invalid product status.');
  const pricing = validatePricing(data.pricing);
  const name = text(data.name, 'name', 180, true);
  if (!Array.isArray(data.sizes) || !data.sizes.length || data.sizes.length > 100) throw new Error('Add at least one size.');
  const sizes = data.sizes.map(size => ({ label: text(size.label, 'size label', 100, true), value: text(size.value, 'size value', 100, true), dimensions: text(size.dimensions || '', 'dimensions', 200) }));
  if (new Set(sizes.map(size => size.value)).size !== sizes.length) throw new Error('Size values must be unique.');
  const features = Array.isArray(data.features) ? data.features.map(value => text(value, 'feature', 500)).slice(0, 40) : [];
  const specs = {};
  for (const [key, value] of Object.entries(data.specs || {})) {
    if (['__proto__', 'constructor', 'prototype'].includes(key) || /[.$]/.test(key)) throw new Error('Invalid specification key.');
    specs[text(key, 'specification key', 100, true)] = text(value, 'specification', 500);
  }
  const marketplaceCompatible = Array.isArray(data.marketplaceCompatible) ? data.marketplaceCompatible.filter(value => ['amazon', 'flipkart', 'myntra', 'meesho'].includes(value)) : [];
  return { id: data.id, slug: data.slug, name, shortName: name.slice(0, 40), category: data.category, type: text(data.type || '', 'type', 100), description: text(data.description || '', 'description', 10000), image: imagePath(data.image), gallery: (Array.isArray(data.gallery) && data.gallery.length ? data.gallery : [data.image]).slice(0, 30).map(imagePath), sizes, pricing, basePrice: pricing[0].pricePerUnit, bulkPrice: Math.min(...pricing.map(tier => tier.pricePerUnit)), features, specs, marketplaceCompatible, inStock: data.inStock, bestSeller: data.bestSeller };
}
