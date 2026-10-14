import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import dbConnect from '@/lib/db';
import SupplierPriceRecord from '@/models/SupplierPriceRecord';
import SupplierVariantOverride from '@/models/SupplierVariantOverride';
import { priceBookSource,priceBookGroups,priceBookItems } from '@/data/ecosoft-price-book';
import { validatePriceSettings,calculatePrice,priceBookCsv } from '@/lib/price-book';
import { supplierSnapshot } from '@/lib/supplier-catalogue';
import { supplierCategory,validateVariantOverride } from '@/lib/supplier-products';
import { excludedFromStorefront } from '@/lib/storefront-policy';

export const dynamic='force-dynamic';
const headers={'Cache-Control':'private, no-store'};
const json=(data,status=200)=>NextResponse.json(data,{status,headers});
export async function GET(request) {
  let records=[],editingEnabled=false;
  try { await dbConnect(); records=await SupplierPriceRecord.find({}).lean(); editingEnabled=true; } catch { /* Readable source remains available. */ }
  if(new URL(request.url).searchParams.get('format')==='csv') {
    // Never silently export an incomplete set of saved commercial records.
    if(!editingEnabled)return json({error:'Database unavailable. Saved pricing records cannot be exported.'},503);
    return new Response(priceBookCsv(priceBookItems,records),{headers:{...headers,'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="ecosoft-purchase-price-book.csv"'}});
  }
  return json({source:priceBookSource,groups:priceBookGroups,items:priceBookItems,records,editingEnabled});
}
export async function PUT(request) {
  let input,item,settings;
  try {
    input=await request.json(); item=priceBookItems.find(item=>item.id===input.itemId);
    if(!item)throw new Error('Unknown price-book item.');
    if(!Number.isInteger(input.revision) || input.revision<0)throw new Error('Invalid revision.');
    settings=validatePriceSettings(input.settings,item);
  } catch(error){return json({error:error.message},400);}
  try {
    await dbConnect();
    // First writes must wait for the unique item index, including a new database.
    await SupplierPriceRecord.init();
    const values={settings,sourceFile:priceBookSource.file,sourceUnitCost:item.tiers.find(t=>t.quantity===settings.tierQuantity).unitCost,appliedAt:null};
    let record;
    if(input.revision===0) record=await SupplierPriceRecord.create({itemId:item.id,...values,revision:1});
    else record=await SupplierPriceRecord.findOneAndUpdate({itemId:item.id,revision:input.revision},{$set:values,$inc:{revision:1}},{new:true,runValidators:true});
    if(!record)return json({error:'This record changed in another session. Reload before saving.'},409);
    return json({record});
  } catch(error){return json({error:error.code===11000?'This record already exists. Reload before saving.':'Database unavailable. No pricing changes were saved.'},error.code===11000?409:503);}
}
export async function POST(request) {
  // Deliberate application to one explicitly matched storefront pack; never match by reused SKU.
  try {
    const input=await request.json();
    if(typeof input.itemId!=='string' || !Number.isInteger(input.revision))return json({error:'Invalid pricing record.'},400);
    await dbConnect();
    const record=await SupplierPriceRecord.findOne({itemId:input.itemId,revision:input.revision}).lean();
    if(!record)return json({error:'Save or reload the pricing record first.'},409);
    const item=priceBookItems.find(item=>item.id===record.itemId);
    if(!item)return json({error:'Source item no longer exists.'},409);
    const s=record.settings,quote=calculatePrice(item,s);
    if(!quote.ready || !s.matchConfirmed)return json({error:'Complete costs, GST, supplier checks and exact variant matching first.'},400);
    const snapshot=await supplierSnapshot();
    const product=snapshot.products.find(p=>String(p.supplierId)===s.productId);
    if(!product || excludedFromStorefront(product) || supplierCategory(product.title)!=='courier-bags')return json({error:'Choose an active courier-bag product.'},400);
    const variant=product.variants.find(v=>String(v.id)===s.variantId);
    if(!variant)return json({error:'The matched variant no longer exists.'},400);
    const previous=await SupplierVariantOverride.findOne({variantId:s.variantId}).lean();
    const data=validateVariantOverride({productId:s.productId,variantId:s.variantId,
      sellingPrice:quote.packSubtotal,packQuantity:s.packQuantity,
      available:previous?.available??(variant.available&&Number(variant.price)>0),
      commercial:{...previous?.commercial,purchaseCost:Math.round(quote.unitCost*s.packQuantity*100)/100,
        targetMargin:s.targetMargin,gstHsn:s.gstHsn,gstRate:s.gstRate,gstTreatment:'exclusive',
        deliveryRule:'Outbound delivery allowance included in pack estimate; confirm destination before final quotation.',
        deliveryCharge:0,confirmed:false,
        notes:`PDF price book: ${item.id}. Purchase cost excludes GST and freight. Costing batch: ${s.quantity} bags. Inbound freight: INR ${s.inboundFreight}; handling/bag: INR ${s.handlingPerBag}; outbound allowance/pack: INR ${s.outboundPerPack}. ${s.notes}`.slice(0,1000),
      }},snapshot);
    data.commercial.confirmedAt=null;
    await SupplierVariantOverride.findOneAndUpdate({variantId:s.variantId},{$set:data},{upsert:true,runValidators:true});
    revalidateTag('products',{expire:0});
    return json({applied:true,message:'Pack estimate and purchase cost saved to the matched website variant. Quote availability and owned stock were preserved. Final commercial approval remains pending.'});
  } catch {return json({error:'Could not apply the pricing record. Reload the variant before retrying.'},503);}
}
