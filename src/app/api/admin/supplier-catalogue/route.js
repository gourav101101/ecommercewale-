import { NextResponse } from 'next/server';
import fallback from '../../../../../research/ecosoft-full-catalogue.json';
import { supplierSnapshot } from '@/lib/supplier-catalogue';
import dbConnect from '@/lib/db';
import SupplierVariantOverride from '@/models/SupplierVariantOverride';
import { validateVariantOverride } from '@/lib/supplier-products';
import { revalidateTag } from 'next/cache';
import { supplierVisual, supplierReferenceImage } from '@/lib/supplier-visuals';
import { commercialReviewRows } from '@/lib/supplier-commercial-review';
import { excludedFromStorefront } from '@/lib/storefront-policy';
import { sourcePackDetails } from '@/lib/courier-options';
import { supplierCategory } from '@/lib/supplier-products';

export const dynamic = 'force-dynamic';
export async function GET(request) {
  const headers = { 'Cache-Control': 'private, no-store' };
  let overrides=[];
  let catalogue=fallback;
  let editingEnabled=false;
  if(process.env.MONGODB_URI) {
    try { await dbConnect(); catalogue=await supplierSnapshot(); overrides=await SupplierVariantOverride.find({}).lean(); editingEnabled=true; }
    catch { /* Source review is still readable; saving is explicitly disabled. */ }
  }
  const byVariant=new Map(overrides.map(item=>[item.variantId,item]));
  if (new URL(request.url).searchParams.get('format') === 'csv') {
    const quote = value => '"' + String(value ?? '').replaceAll('"', '""').replace(/^[=+@-]/, "'$&") + '"';
    const rows = commercialReviewRows(catalogue,overrides);
    return new Response('\uFEFF' + rows.map(row => row.map(quote).join(',')).join('\n'), { headers: { ...headers, 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="ecosoft-variants-review.csv"' } });
  }
  return NextResponse.json({
    fetchedAt: catalogue.fetchedAt, productCount: catalogue.productCount, variantCount: catalogue.variantCount, editingEnabled,
    sitemapProductCount: catalogue.sitemapProductCount, missingFromFeed: catalogue.missingFromFeed,
    feedExhausted: catalogue.feedExhausted, note: catalogue.note,
    products: catalogue.products.map(product => ({
      id: product.supplierId, slug:product.handle, title: product.title, source: product.source, options: product.options,
      images: product.images.map(image=>({...image,src:supplierReferenceImage(String(image.id),image.src)})),
      imageStatus:supplierVisual(product).imageStatus,
      storefrontExcluded:excludedFromStorefront(product),
      commercialStatus:'confirmation-pending',
      referenceImages:product.images,
      variants: product.variants.map(variant => ({ id: variant.id, title: variant.title, sku: variant.sku, price: variant.price, available: variant.available, sellingPrice:byVariant.get(String(variant.id))?.sellingPrice??null, commercial:byVariant.get(String(variant.id))?.commercial??null, storeAvailable:byVariant.get(String(variant.id))?.available??(variant.available&&Number(variant.price)>0),
        ...(supplierCategory(product.title)==='courier-bags' ? {...sourcePackDetails(product,variant,byVariant.get(String(variant.id))),isCourierBag:true,confirmedPackQuantity:byVariant.get(String(variant.id))?.packQuantity??null} : {}) })),
    })),
  }, { headers });
}

export async function PATCH(request) {
  let data;
  let snapshot;
  try { snapshot = await supplierSnapshot(); }
  catch { return NextResponse.json({error:'Catalogue database unavailable. No changes were saved.'},{status:503}); }
  try { data=validateVariantOverride(await request.json(),snapshot); }
  catch(error) { return NextResponse.json({error:error.message},{status:400}); }
  if(!process.env.MONGODB_URI) return NextResponse.json({error:'Connect MongoDB to save variant settings. No changes were saved.'},{status:503});
  try {
    await dbConnect();
    if(data.commercial) {
      const previous=await SupplierVariantOverride.findOne({variantId:data.variantId}).lean();
      data.commercial.stockVerifiedAt=data.commercial.stockQuantity==null ? null : previous?.commercial?.stockQuantity===data.commercial.stockQuantity ? previous.commercial.stockVerifiedAt || new Date() : new Date();
      data.commercial.confirmedAt=data.commercial.confirmed ? new Date() : null;
    } else {
      data['commercial.confirmed']=false;
      data['commercial.confirmedAt']=null;
    }
    await SupplierVariantOverride.findOneAndUpdate({variantId:data.variantId},{$set:data},{upsert:true,runValidators:true});
    revalidateTag('products',{expire:0});
    return NextResponse.json({saved:true,...data},{headers:{'Cache-Control':'private, no-store'}});
  } catch { return NextResponse.json({error:'Could not save variant settings. Please retry.'},{status:500}); }
}
