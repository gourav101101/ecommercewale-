// Supplier public prices/availability are references, not our landed costs,
// owned stock, confirmed selling prices or evidence of a particular GST rate.
export function commercialReviewRows(snapshot, overrides = []) {
  const byVariant = new Map(overrides.map(item => [String(item.variantId),item]));
  const rows = [['product_id','product','source','variant_id','variant','sku','snapshot_at',
    'supplier_reference_price_INR','supplier_listed_available','source_taxable_flag',
    'source_image_id','source_image_url','store_quote_estimate_INR',
    'confirmed_purchase_cost_INR','confirmed_selling_price_INR','target_margin_percent',
    'verified_stock_quantity','stock_verified_at','GST_HSN','GST_rate_percent',
    'GST_included_in_selling_price','delivery_rule','delivery_charge_INR',
    'exact_colour_design_verified','product_photo_approved','review_status','review_notes','confirmed_bags_per_pack']];
  for (const product of snapshot.products) for (const variant of product.variants) {
    const override=byVariant.get(String(variant.id));
    const commercial=override?.commercial || {};
    const photo = variant.featured_image || product.images?.[0];
    const note = product.handle === 'amazon-prime-tape-use-for-packaging'
      ? 'Supplier description says 150m; option says 130m. Confirm actual roll length. Supplier photo is black printed tape, not plain transparent tape.'
      : /thank.*review.*card/i.test(product.title)
        ? 'Verify the specific design against this variant image; designs are not interchangeable.' : '';
    rows.push([String(product.supplierId),product.title,product.source,String(variant.id),variant.title,
      variant.sku || '',snapshot.fetchedAt,variant.price,variant.available,variant.taxable ?? '',
      photo?.id || '',photo?.src || '',override?.sellingPrice ?? '',
      commercial.purchaseCost ?? '',commercial.confirmed ? override?.sellingPrice ?? '' : '',commercial.targetMargin ?? '',
      commercial.stockQuantity ?? '',commercial.stockVerifiedAt || '',commercial.gstHsn || '',commercial.gstRate ?? '',
      commercial.gstTreatment==='pending' || !commercial.gstTreatment ? '' : commercial.gstTreatment==='inclusive',
      commercial.deliveryRule || '',commercial.deliveryCharge ?? '', '', '',
      commercial.confirmed ? 'owner-confirmed' : 'confirmation-pending',[note,commercial.notes].filter(Boolean).join(' '),override?.packQuantity ?? '']);
  }
  return rows;
}
