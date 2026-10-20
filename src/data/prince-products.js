// Transcribed from the owner's Prince Enterprises supplier sheets, 15 Oct 2026.
// Supplier references are quote estimates, not confirmed EcommerceWale prices.
const image = '/images/product-image-under-review.svg';
const barcodeRows = [
  ['38x25',1,61,2000], ['38x25',2,122,4000],
  ['38x50',1,61,1000], ['38x50',2,122,2000],
  ['38x38',1,70,1500], ['38x38',2,140,3000],
  ['50x25',1,80,2000], ['50x25',2,160,4000],
  ['50x50',1,80,1000], ['50x50',2,160,2000],
  ['60x30',1,87,1500], ['60x40',1,116,1500],
  ['70x30',1,101,1500], ['70x48',1,108,1000],
  ['70x35',1,118,1500], ['75x38',1,138,1500],
  ['75x50',1,120,1000], ['75x75',1,135,750],
  ['80x40',1,155,1500], ['80x60',1,155,1000],
  ['75x125',1,150,500], ['100x25',1,160,2000],
  ['100x50',1,160,1000], ['100x75',1,120,500],
  ['100x100',1,160,500], ['100x150',1,192,400],
];

function variant(id, title, price, extra = {}) {
  return { id: `prince-${id}`, title, values: [title], price, sourcePrice: price,
    available: price > 0, priceBasis: 'supplier-reference', image,
    imageStatus: 'review-pending', sku: '', ...extra };
}

function product(slug, name, category, variants, description, features, pricingNote) {
  const minimum = Math.min(...variants.map(item => item.price));
  return { id: slug, slug, name, shortName: name, category,
    supplierId: 'prince-enterprises', supplierName: 'Prince Enterprises, Indore',
    type: category === 'printers' ? 'Label printer' : 'Label rolls',
    description, features, pricingNote, pricingMode: 'variant',
    options: [{ name: category === 'printers' ? 'Model' : 'Size / roll', values: variants.map(item => item.title) }],
    variants, variantCount: variants.length, priceUnit: 'pack/item',
    basePrice: minimum, bulkPrice: minimum, inStock: variants.some(item => item.available),
    image, imageStatus: 'review-pending', gallery: [image],
    visualDisclosure: 'Exact product photography is pending. This placeholder does not depict the supplied product.',
    commercialStatus: 'confirmation-pending', snapshotAt: '2026-10-15T00:00:00+05:30',
    sizes: [], pricing: [], specs: {}, reviews: [], marketplaceCompatible: [], bestSeller: false };
}

export const princeProducts = [
  product('prince-shipping-label-rolls', 'Shipping Label Rolls — Prince', 'labels', [
    variant('shipping-4x6', '4 × 6 inches / 400 labels minimum / roll', 155, { labelsPerRoll: 400, rollsPerBox: 40 }),
    variant('shipping-3x5', '3 × 5 inches / 500 labels / roll', 135, { labelsPerRoll: 500, rollsPerBox: 40 }),
  ], 'Shipping label rolls in two sizes. Supplier reference prices are per roll; the supplier lists 40 rolls per box.',
  ['4 × 6 inches: ₹155 + GST, 400 labels minimum', '3 × 5 inches: ₹135 + GST, 500 labels per roll', '40 rolls per box; confirm minimum order and printer compatibility'],
  'Reference price per roll, GST extra. Supplier packing: 40 rolls per box. Confirm whether loose rolls are supplied and the minimum order before payment.'),
  product('prince-plain-barcode-label-rolls', 'Plain Barcode Label Rolls — Prince', 'labels',
    barcodeRows.map(([size,up,price,count]) => variant(`barcode-${size}-${up}up`, `${size.replace('x',' × ')} mm / ${up}up / ${count.toLocaleString('en-IN')} labels`, price, { labelsPerRoll: count, gstRate: 18 })),
    'Plain barcode label rolls in the supplier-listed sizes and 1up / 2up layouts. Choose the exact size, layout and label count before requesting a quote.',
    ['26 size and layout options', 'Prices cover the listed roll quantity', 'Supplier sheet states 18% GST extra', 'Confirm material, ribbon requirement and printer compatibility'],
    'Supplier reference per listed roll quantity, excluding 18% GST. Final selling price, stock, minimum order and delivery are confirmed in your quote.'),
  product('prince-dcode-dc2m-printer', 'DCode DC2M Label Printer', 'printers',
    [variant('dcode-dc2m', 'DC2M / USB / 2 inch', 0)],
    'DCode DC2M printer identified from the supplier carton. Ask our team to confirm the selling price, warranty and supported label sizes.',
    ['Model: DC2M', 'Carton size marking: 2 inch', 'Interface: USB only', 'Price and warranty confirmation pending'],
    'Price on request. The supplier messages do not clearly associate the quoted prices or warranty periods with a specific printer. Confirm compatibility before ordering; this 2-inch printer is not listed as a 4 × 6-inch shipping-label printer.'),
  product('prince-dcode-dc421d-printer', 'DCode DC421D Label Printer', 'printers',
    [variant('dcode-dc421d', 'DC421D / Direct thermal', 0)],
    'DCode DC421D direct thermal label printer, identified from the supplier packaging photograph.',
    ['Model: DC421D', 'Printing method: Direct thermal', 'Packaging marked Made in India', 'Confirm supported label sizes, interface and warranty before ordering'],
    'Price on request. Confirm the selling price, GST, warranty and supported label sizes with our team.'),
].map(item => {
  if (item.category !== 'printers') return item;
  const dc2m = item.slug === 'prince-dcode-dc2m-printer';
  const gallery = dc2m
    ? ['/images/prince/dcode-dc2m-studio-v1.webp']
    : ['/images/prince/dcode-dc421d-desktop-v2.webp'];
  return { ...item, image: gallery[0], gallery, imageStatus: 'reference-edited',
    imageScale: 1,
    snapshotAt: '2026-10-16T00:00:00+05:30',
    visualDisclosure: dc2m
      ? 'AI-edited presentation based on the supplier printer photograph, with the hand, background and protective film removed and studio lighting added. Confirm physical appearance and supplied contents before ordering.'
      : 'AI-generated presentation based on the supplier DC421D packaging illustration, with a wider desktop-style appearance. Proportions are illustrative, not verified physical dimensions or a photograph of an unboxed unit. Confirm physical appearance, dimensions and supplied contents before ordering.',
    variants: item.variants.map(option => ({ ...option, image: gallery[0], imageStatus: 'reference-edited' })),
  };
});
