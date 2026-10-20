export const categories = [
  {
    id: 'printers', name: 'Label Printers', slug: 'printers',
    description: 'Label printers with model specifications and pricing on request',
    icon: 'Printer', image: '/images/prince/dcode-dc2m-studio-v1.webp', color: '#2668A5',
  },
  {
    id: 'courier-bags',
    name: 'Courier Bags',
    slug: 'courier-bags',
    description: 'Paper, opaque and transparent mailers for your next dispatch.',
    icon: 'Package',
    image: '/images/supplier/51132052472106.webp',
    color: '#FF6B35',
  },
  {
    id: 'boxes',
    name: 'Boxes',
    slug: 'boxes',
    description: 'Corrugated shipping boxes and flap boxes in the listed sizes',
    icon: 'Box',
    image: '/images/supplier-edited/box-tape-51698465407274-v1.webp',
    color: '#00C9A7',
  },
  {
    id: 'tapes',
    name: 'Tapes',
    slug: 'tapes',
    description: 'Packing tapes with plain and printed designs, sold by selected pack',
    icon: 'Package',
    image: '/images/supplier-edited/box-tape-51143049675050-v1.webp',
    color: '#D49C52',
  },
  {
    id: 'labels',
    name: 'Labels',
    slug: 'labels',
    description: 'Thermal shipping labels and barcode label rolls',
    icon: 'Tag',
    image: '/images/supplier-edited/thermal-label-4x6-v1.webp',
    color: '#7C5CFC',
  },
  {
    id: 'shredded-paper',
    active: false,
    name: 'Shredded Paper',
    slug: 'shredded-paper',
    description: 'Premium packaging fillers for a delightful unboxing experience',
    icon: 'Scissors',
    image: '/images/supplier-edited/orange-paper-shredded-v2.webp',
    color: '#FF4081',
  },
];

// Products come from supplier catalogues or recorded database entries.
export const products = [];

export function getProductBySlug(slug) {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(categorySlug) {
  return products.filter((p) => p.category === categorySlug);
}

export function getBestSellers() {
  return products.filter((p) => p.bestSeller);
}

export function getRelatedProducts(productId, limit = 4) {
  const product = products.find((p) => p.id === productId);
  if (!product) return [];
  return products
    .filter((p) => p.category === product.category && p.id !== productId)
    .slice(0, limit);
}

export function calculatePrice(pricing, quantity) {
  if (!Array.isArray(pricing) || pricing.length === 0) {
    return 0;
  }

  const tier = pricing.find(
    (t) => quantity >= t.minQty && (t.maxQty === null || quantity <= t.maxQty)
  );
  return tier ? tier.pricePerUnit : pricing[0].pricePerUnit;
}

export function searchProducts(query) {
  const q = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.type.toLowerCase().includes(q)
  );
}
