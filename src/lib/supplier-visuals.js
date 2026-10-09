import referenceImages from '../data/supplier-reference-images.json';
import editedImages from '../data/supplier-edited-images.json';
import labelImages from '../data/label-edited-images.json';
import boxTapeImages from '../data/box-tape-edited-images.json';
import boxVariantImages from '../data/box-variant-edited-images.json';
import boxDimensionImages from '../data/box-dimension-edited-images.json';
import corrugatedDimensionImages from '../data/corrugated-dimension-edited-images.json';

const variantDimensionImages=Object.freeze({...boxDimensionImages,...corrugatedDimensionImages});

// The owner authorised actual supplier photos. Never substitute a generic
// family render or a different design for the selected source image.
export const SUPPLIER_IMAGE_PENDING = '/images/product-image-under-review.svg';
export const approvedSupplierVisuals = Object.freeze({...editedImages,...labelImages,...boxTapeImages,...boxVariantImages});

function allowedSupplierPhoto(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname === 'cdn.shopify.com' && parsed.pathname.startsWith('/s/files/1/0965/0018/7434/');
  } catch { return false; }
}

export function supplierReferenceImage(imageId, sourceUrl) {
  const edited=approvedSupplierVisuals[imageId];
  if(edited && edited.source===sourceUrl) return edited.image;
  return supplierOriginalReferenceImage(imageId,sourceUrl);
}

export function supplierOriginalReferenceImage(imageId,sourceUrl) {
  const local = referenceImages.images[imageId];
  if (local && local.source === sourceUrl) return local.image;
  return allowedSupplierPhoto(sourceUrl) ? sourceUrl : SUPPLIER_IMAGE_PENDING;
}

export function savedSupplierImage(product) {
  if (product.sourceImageUrl) {
    const dimensionImage=product.variantId && variantDimensionImages[product.sourceImageId];
    return dimensionImage && dimensionImage.source===product.sourceImageUrl ? dimensionImage.image : supplierReferenceImage(product.sourceImageId,product.sourceImageUrl);
  }
  // Restore old saved lists that predate source-image metadata, by exact IDs.
  const source = referenceImages.products[product.id];
  const imageId = product.variantId ? source?.variants[product.variantId] || source?.imageId : source?.imageId;
  const reference=referenceImages.images[imageId];
  const dimensionImage=product.variantId && variantDimensionImages[imageId];
  if(dimensionImage && dimensionImage.source===reference?.source) return dimensionImage.image;
  return reference ? supplierReferenceImage(imageId,reference.source) : SUPPLIER_IMAGE_PENDING;
}

export function supplierVisual(source, variant) {
  const reference = variant?.featured_image || source.images?.[0];
  const imageId = reference?.id ? String(reference.id) : null;
  // Dimension photos belong to exact variants, not family-level catalogue cards.
  const dimensionImage=variant && imageId && variantDimensionImages[imageId];
  const approved = dimensionImage && dimensionImage.source===reference?.src ? dimensionImage : imageId && approvedSupplierVisuals[imageId];
  const matches = Boolean(approved && approved.source === reference?.src);
  return {
    image: matches ? approved.image : supplierReferenceImage(imageId,reference?.src),
    sourceImageId: imageId,
    sourceImageUrl: reference?.src || null,
    imageStatus: matches ? 'reference-edited' : reference?.src && allowedSupplierPhoto(reference.src) ? 'supplier-photo' : 'review-pending',
  };
}
