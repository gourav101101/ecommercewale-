// Pure transformation: the source export remains unchanged. Prices are per
// selected supplier pack/item, never divided into an assumed piece quantity.
import { productContent } from './product-visuals.js';
import { supplierVisual, supplierReferenceImage, supplierOriginalReferenceImage, approvedSupplierVisuals } from './supplier-visuals.js';
import { validateCommercialSettings } from './supplier-commercial-settings.js';
import { excludedFromStorefront } from './storefront-policy.js';
import boxTapeGalleries from '../data/box-tape-galleries.json';
import { sourcePackDetails, positivePackQuantity, courierSizeLabel } from './courier-options.js';

export function supplierCategory(title) {
  if (/shredded/i.test(title)) return 'shredded-paper';
  if (/label|sticker|card/i.test(title)) return 'labels';
  if (/tape/i.test(title)) return 'tapes';
  if (/box/i.test(title)) return 'boxes';
  return 'courier-bags';
}

function supplierImageDisclosure(source,name) {
  const category=supplierCategory(name);
  if(['boxes','tapes'].includes(category)) return 'Main presentation images are AI background/framing edits of actual supplier references, not new product designs. Repetitive promotional graphics are omitted from the gallery. Reviewed flap-box and corrugated-box options use reference-edited size photos with measurement arrows drawn close to the box edges. The original supplier photo is available separately for comparison; edited photos are not a scale drawing or a guarantee of internal dimensions or tolerances. Dimensions, width, length and pack quantity come from the selected variant, not the pictured roll count or box proportions. Demonstration cartons on tape photos and other styling props are not included. Printed artwork is visually reviewed, not guaranteed pixel-identical; confirm the physical product and current design before ordering.';
  if(supplierVisual(source).imageStatus!=='reference-edited') return 'Actual Ecosoft supplier photograph, not an AI-generated product. Variant-specific photos are shown where supplied; otherwise the supplier main photo is used. Confirm current colour, artwork and pack contents before ordering.';
  if(category==='shredded-paper') return 'Presentation edited from the actual Ecosoft supplier image using AI, with the same paper colour family and cut style retained. Original supplier images remain in the gallery for comparison. Bowls, boxes, mugs and jars are styling props, not included. Images do not establish pack weight or exact volume; confirm the physical product before ordering.';
  return 'Supplier-reference image with AI-edited background and framing. Only the reviewed edited images are displayed here. Dimensions and quantity come from your selected variant, not the number of rolls pictured. Barcode/size printing in source images is demonstration artwork, not a guarantee that plain labels arrive preprinted or that a pictured barcode scans. Confirm stock, printer compatibility and actual contents before ordering.';
}

export function buildSupplierProducts(snapshot, overrides = []) {
  const byVariant = new Map(overrides.map(item => [String(item.variantId), item]));
  return snapshot.products.filter(source=>!excludedFromStorefront(source)).map(source => {
    // Supplier delivery promotions are not EcommerceWale delivery promises.
    const optionIndexes = source.options.map((option,index) => ({option,index})).filter(({option}) => !/^note$/i.test(option.name));
    const options = optionIndexes.map(({option}) => ({name: /pack|^piece$/i.test(option.name) ? 'Pack' : /size/i.test(option.name) ? 'Size' : /design/i.test(option.name) ? 'Design' : option.name, values:option.values}));
    const variants = source.variants.map(item => {
      const override = byVariant.get(String(item.id));
      const sourcePrice = Number(item.price);
      const price = override?.sellingPrice ?? sourcePrice;
      const values = optionIndexes.map(({index}) => String(item[`option${index+1}`] || 'Standard'));
      const courier=supplierCategory(source.title)==='courier-bags';
      const pack=courier ? sourcePackDetails(source,item,override) : {};
      const title=courier ? values.map((value,index)=>options[index].name==='Pack' ? pack.packLabel : options[index].name==='Size' ? courierSizeLabel(value) : value).join(' / ') : values.join(' / ');
      const imageVariant = !item.featured_image && source.handle==='thermal-shipping-label-roll'
        ? source.variants.find(peer=>peer.option1===item.option1 && peer.featured_image) || item : item;
      // Pack counts do not change the physical size/design. Reuse a reference
      // only when every non-pack option matches, never across different widths.
      const identityOptions=source.options.map((option,index)=>({option,index})).filter(({option})=>!/pack|piece|^note$/i.test(option.name));
      const resolvedImageVariant=!imageVariant.featured_image && ['boxes','tapes','courier-bags'].includes(supplierCategory(source.title)) && identityOptions.length
        ? source.variants.find(peer=>peer.featured_image && identityOptions.every(({index})=>peer[`option${index+1}`]===item[`option${index+1}`])) || imageVariant : imageVariant;
      return {id:String(item.id), title, values, sku:item.sku || '', price, sourcePrice, ...pack,
        available: (override?.available ?? item.available) && Number.isFinite(price) && price>0,
        priceBasis:override?.sellingPrice != null ? 'store-estimate' : 'supplier-reference',
        ...supplierVisual(source,resolvedImageVariant),
        ...(supplierCategory(source.title)==='boxes' ? {originalSizeReference:supplierOriginalReferenceImage(String((resolvedImageVariant.featured_image || source.images?.[0])?.id),(resolvedImageVariant.featured_image || source.images?.[0])?.src)} : {})};
    });
    const prices = variants.filter(item => item.available).map(item => item.price);
    const positive = variants.filter(item => item.price>0).map(item => item.price);
    const minimum = Math.min(...(prices.length ? prices : positive.length ? positive : [0]));
    const cleanedName = source.title.replace(/\(\s*100%\s*barcode working\s*\)/ig,'').replace(/\s+/g,' ').trim();
    const name = cleanedName === cleanedName.toUpperCase() ? cleanedName.toLowerCase().replace(/\b[a-z]/g,letter=>letter.toUpperCase()) : cleanedName;
    return {id:`ecosoft-${source.supplierId}`, slug:source.handle, name, shortName:name, category:supplierCategory(name),
      type:supplierCategory(name)==='courier-bags'?'Courier packaging':'Packaging essentials', ...productContent(name),
      ...(supplierCategory(name)==='courier-bags' ? {courierDetails:{finish:/paper/i.test(name)?'paper':/transparent/i.test(name)&&!/non\s*transparent/i.test(name)?'transparent':'opaque',pocket:/without pocket/i.test(name)?'without':/pocket|pod/i.test(name)?'with':'unspecified'}} : {}),
      pricingMode:'variant', options, variants, variantCount:variants.length, priceUnit:'pack/item',
      packConfirmationRequired:supplierCategory(name)==='courier-bags' && variants.every(item=>item.packConfirmationRequired),
      sizes:[], pricing:[], basePrice:minimum, bulkPrice:minimum, ...supplierVisual(source),
      gallery:[...new Set((source.images || []).flatMap(image=>{
        const edited=approvedSupplierVisuals[String(image.id)];
        if(supplierCategory(name)==='courier-bags') return String(image.id)===String(source.images?.[0]?.id) ? [supplierReferenceImage(String(image.id),image.src)] : [];
        if(['boxes','tapes'].includes(supplierCategory(name))) {
          const selected=boxTapeGalleries[source.handle] || [];
          return selected.includes(String(image.id)) && edited?.source===image.src ? [edited.image] : [];
        }
        // Labels show only the reviewed edits; supplier originals are private
        // research/admin references, not customer gallery slides.
        if(supplierCategory(name)==='labels') return edited?.source===image.src ? [edited.image] : [];
        return edited?.source===image.src ? [edited.image,image.src] : [supplierReferenceImage(String(image.id),image.src)];
      }))], inStock:variants.some(item => item.available), bestSeller:false,
      visualDisclosure:supplierImageDisclosure(source,name),
      commercialStatus:'confirmation-pending',
      marketplaceCompatible:['amazon','flipkart','myntra','meesho'].filter(value => name.toLowerCase().includes(value)),
      supplierId:String(source.supplierId), sourceUrl:source.source, snapshotAt:snapshot.fetchedAt,
      specs:{}, reviews:[], updatedAt:source.updatedAt};
  });
}

export function variantOrderable(variant) {
  return Boolean(variant?.available && !variant.packConfirmationRequired && Number.isFinite(variant.price) && variant.price>0);
}

export function variantCartItem(product, variantId, quantity) {
  if(excludedFromStorefront(product)) return null;
  const variant = product.variants?.find(item => item.id===String(variantId));
  if (product.inStock===false || !variantOrderable(variant) || !Number.isInteger(quantity) || quantity<1 || quantity>999999) return null;
  return {id:product.id, slug:product.slug, name:product.name, image:variant.image, packQuantity:variant.packQuantity ?? null,
    sourceImageId:variant.sourceImageId, sourceImageUrl:variant.sourceImageUrl, imageStatus:variant.imageStatus,
    selectedSize:variant.id, variantId:variant.id, sizeLabel:variant.title, quantity,
    pricing:[{minQty:1,maxQty:null,pricePerUnit:variant.price,label:'Selected pack/item'}], pricePerUnit:variant.price,
    priceUnit:'pack/item', pricingMode:'variant', priceBasis:variant.priceBasis, sku:variant.sku, snapshotAt:product.snapshotAt};
}

export function validateVariantOverride(data, snapshot) {
  const source = snapshot.products.find(item => String(item.supplierId)===String(data?.productId));
  const variant = source?.variants.find(item => String(item.id)===String(data?.variantId));
  if (!variant) throw new Error('Choose a valid supplier variant.');
  if (typeof data.available!=='boolean') throw new Error('Availability must be true or false.');
  const sellingPrice = data.sellingPrice === null || data.sellingPrice === '' ? null : Number(data.sellingPrice);
  if (sellingPrice!==null && (!Number.isFinite(sellingPrice) || sellingPrice<=0 || sellingPrice>10000000 || Math.abs(sellingPrice*100-Math.round(sellingPrice*100))>0.000001)) throw new Error('Price must be positive with at most two decimal places. Leave blank to use the supplier reference.');
  if (data.available && !(sellingPrice ?? Number(variant.price))) throw new Error('Set a positive price before enabling this variant.');
  const packQuantity=data.packQuantity==null || data.packQuantity==='' ? null : positivePackQuantity(data.packQuantity);
  if(data.packQuantity!=null && data.packQuantity!=='' && packQuantity==null) throw new Error('Confirmed pack quantity must be a whole number from 1 to 999,999.');
  if(packQuantity!=null && supplierCategory(source.title)!=='courier-bags') throw new Error('Bag-count confirmation applies only to courier bags.');
  return {productId:String(source.supplierId),variantId:String(variant.id),sellingPrice,available:data.available,
    ...(data.packQuantity!==undefined ? {packQuantity} : {}),
    ...(data.commercial!==undefined ? {commercial:validateCommercialSettings(data.commercial,sellingPrice)} : {})};
}
