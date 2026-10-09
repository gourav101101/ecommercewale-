import { savedSupplierImage } from './supplier-visuals.js';
// Original generated family illustrations. Source photography is retained only
// in the research export, never used as a storefront product image.
export function productVisual(title = '') {
  const text = title.toLowerCase();
  let key;
  if (/shredded/.test(text)) {
    const colour = ['dark cyan green','light blue','light green','gold','yellow','green','blue','orange','white'].find(value => text.includes(value)) || 'white';
    key = `shred-${colour.replaceAll(' ', '-')}`;
  } else if (/dispenser/.test(text)) key = 'tape-dispenser';
  else if (/thank.*card|review card/.test(text)) key = 'thankyou-card';
  else if (/thank.*sticker/.test(text)) key = 'thankyou-sticker';
  else if (/barcode.*label/.test(text)) key = 'label-barcode';
  else if (/label|sticker/.test(text)) key = 'label-shipping';
  else if (/tape/.test(text)) key = /fragile/.test(text) ? 'tape-fragile' : /brown/.test(text) ? 'tape-brown' : 'tape-clear';
  else if (/box/.test(text)) key = /flap/.test(text) ? (/white/.test(text) ? 'box-flap-white' : 'box-flap-brown') : 'box-brown';
  else if (/paper/.test(text)) key = 'mailer-paper';
  else {
    const pocket = !/without pocket/.test(text) && /pocket|pod/.test(text);
    const clear = /transparent/.test(text) && !/non\s*transparent/.test(text);
    const colour = ['black','blue','red','pink','green','yellow','brown'].find(value => new RegExp(`\\b${value}\\b`).test(text));
    key = clear ? (pocket ? 'mailer-clear-pocket' : 'mailer-clear') : pocket ? `mailer-${colour === 'brown' ? 'kraft' : colour || 'white'}-pocket` : 'mailer-white';
  }
  return `/images/catalogue/${key}.webp`;
}

export function productContent(title) {
  const text = title.toLowerCase();
  let description, features;
  if (/shredded/.test(text)) {
    description = 'Bring colour and texture to a gift box or presentation pack. Choose the listed weight/pack option to build your packing list.';
    features = ['Colour identified in the product name', 'Pack descriptions preserved exactly as supplied', 'Confirm usable fill volume and weight with our team'];
  } else if (/box/.test(text)) {
    description = 'Build a considered packing setup with corrugated boxes. Compare the available dimensions and pack quantities before requesting your quote.';
    features = [/flap/.test(text) ? 'Flap-style box listed by the supplier' : 'Corrugated shipping box', 'Select dimensions and pack quantity separately', 'Confirm internal usable dimensions and assembly requirements'];
  } else if (/label|sticker|card/.test(text)) {
    description = 'Finish the parcel with the right label or insert. Browse the listed designs, sizes and pack options; our team can confirm the exact artwork or printer fit.';
    features = ['Exact listed size or design selections', 'Individual pack and roll prices', 'Confirm artwork, adhesive and printer compatibility before ordering'];
  } else if (/tape/.test(text)) {
    description = /dispenser/.test(text) ? 'Keep your packing station organised with a handheld tape dispenser. Confirm tape width, fit and the included components in your quote.' : 'Choose tape for your packing workflow using the listed width, length and pack options. Each selection has its own reference price.';
    features = ['Supplier-listed measurements shown in the selector', 'Pack quantities priced individually', 'Confirm adhesive, printed design and included accessories'];
  } else {
    description = 'Choose a shipping mailer around what you send. Compare the listed sizes and pack quantities, then ask our team to confirm the fit and finish for your parcel.';
    features = [/paper/.test(text) ? 'Paper mailer family' : /non\s*transparent/.test(text) || !/transparent/.test(text) ? 'Opaque mailer family' : 'Transparent mailer family', /without pocket/.test(text) ? 'Supplier lists no document pocket' : /pocket|pod/.test(text) ? 'Supplier lists a document pocket' : 'Confirm pocket and closure details in your quote', 'Confirm usable size, thickness and printed artwork before ordering'];
  }
  return { description, features, visualDisclosure: 'AI-created product-family illustration. Not an exact SKU photograph. Colour, printing, proportions and contents may differ; confirm the selected option before ordering.' };
}

// Migrate known legacy/source photography while preserving new locally uploaded
// custom-product assets selected by the store owner.
export function storefrontImage(product) {
  if (String(product.id || '').startsWith('ecosoft-') || product.supplierId) {
    return savedSupplierImage(product);
  }
  const image = product.image || '';
  return !image || /^\/images\/(product-|category-)/.test(image) || /cdn\.shopify\.com|images\.unsplash\.com/.test(image) ? productVisual(product.name) : image;
}
