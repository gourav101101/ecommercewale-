export const emptyPriceSettings = {
  quantity: 100, packQuantity: 100, tierQuantity: null, costOverride: null,
  inboundFreight: null, handlingPerBag: null, outboundPerPack: null, feePercent: null,
  targetMargin: 25, sellingPerBag: null, gstRate: null, gstHsn: '',
  purchaseGst: 'pending', supplierConfirmed: false,
  productId: '', variantId: '', matchConfirmed: false, notes: '',
};
export function validatePriceSettings(input, item) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid pricing settings.');
  const result = {};
  for (const [key,max,integer,required] of [
    ['quantity',9999999,true,true],['packQuantity',999999,true,true],['tierQuantity',25000,true,false],
    ['costOverride',100000,false,false],['inboundFreight',10000000,false,false],
    ['handlingPerBag',100000,false,false],['outboundPerPack',10000000,false,false],
    ['feePercent',99,false,false],['targetMargin',99,false,true],['sellingPerBag',100000,false,false],['gstRate',100,false,false],
  ]) {
    const raw=input[key];
    if (raw==null || raw==='') { if(required)throw new Error(`${key} is required.`); result[key]=null; continue; }
    if (!['string','number'].includes(typeof raw) || (typeof raw==='string' && !raw.trim())) throw new Error(`Invalid ${key}.`);
    const value=Number(raw);
    if (!Number.isFinite(value) || value<0 || value>max || (integer ? !Number.isInteger(value) : Math.abs(value*100-Math.round(value*100))>0.000001)) throw new Error(`Invalid ${key}.`);
    if (['quantity','packQuantity','costOverride','sellingPerBag'].includes(key) && value===0) throw new Error(`${key} must be positive.`);
    result[key]=value;
  }
  if (!item.tiers.some(tier=>tier.quantity===result.tierQuantity)) throw new Error('Select a quoted supplier quantity.');
  if (result.tierQuantity!==null && result.quantity!==result.tierQuantity) throw new Error('Purchase quantity must match the quoted tier; obtain a revised quote for other quantities.');
  if (result.packQuantity>result.quantity) throw new Error('Selling pack cannot exceed the purchase batch.');
  if (result.targetMargin+(result.feePercent??0)>=100) throw new Error('Margin plus fee allowance must be below 100%.');
  for(const key of ['gstHsn','notes','productId','variantId']) {
    if(typeof input[key]!=='string' || input[key].length>(key==='notes'?1000:100)) throw new Error(`Invalid ${key}.`);
    result[key]=input[key].trim();
  }
  if(result.gstHsn && !/^(\d{4}|\d{6}|\d{8})$/.test(result.gstHsn)) throw new Error('HSN must contain 4, 6 or 8 digits.');
  if(!['pending','recoverable','cost'].includes(input.purchaseGst)) throw new Error('Choose how purchase GST is treated.');
  result.purchaseGst=input.purchaseGst;
  for(const key of ['supplierConfirmed','matchConfirmed']) {
    if(typeof input[key]!=='boolean') throw new Error(`Invalid ${key}.`);
    result[key]=input[key];
  }
  return result;
}
const round=value=>Math.round((value+Number.EPSILON)*100)/100;
export function calculatePrice(item, settings) {
  const s=validatePriceSettings(settings,item);
  const sourceCost=item.tiers.find(t=>t.quantity===s.tierQuantity).unitCost;
  const unitCost=s.costOverride??sourceCost;
  const missing=[];
  for(const [key,label] of [['inboundFreight','Inbound freight'],['handlingPerBag','Handling cost'],['outboundPerPack','Outbound delivery allowance'],['feePercent','Fee allowance'],['gstRate','GST rate']]) if(s[key]===null)missing.push(label);
  if(!s.gstHsn)missing.push('HSN');
  if(s.purchaseGst==='pending')missing.push('Purchase GST treatment');
  if(!s.supplierConfirmed)missing.push('Supplier specification / quantity confirmation');
  const purchaseTaxPerBag=unitCost*(s.gstRate??0)/100;
  const landedPerBag=unitCost+(s.inboundFreight??0)/s.quantity+(s.handlingPerBag??0)+(s.purchaseGst==='cost'?purchaseTaxPerBag:0);
  const costPerBag=landedPerBag+(s.outboundPerPack??0)/s.packQuantity;
  const denominator=1-(s.targetMargin+(s.feePercent??0))/100;
  const suggestedPerBag=Math.ceil((costPerBag/denominator-1e-9)*100)/100;
  const sellingPerBag=s.sellingPerBag??suggestedPerBag;
  const profitPerBag=sellingPerBag*(1-(s.feePercent??0)/100)-costPerBag;
  const packSubtotal=round(sellingPerBag*s.packQuantity);
  const packGst=s.gstRate===null?null:round(packSubtotal*s.gstRate/100);
  return { sourceCost,unitCost,landedPerBag,costPerBag,suggestedPerBag,sellingPerBag,
    profitPerBag,margin:profitPerBag/sellingPerBag*100,packSubtotal,packGst,
    packTotal:packGst===null?null:round(packSubtotal+packGst),
    purchaseSubtotal:round(unitCost*s.quantity),
    purchaseGoodsGst:s.gstRate===null?null:round(purchaseTaxPerBag*s.quantity),
    completePacks:Math.floor(s.quantity/s.packQuantity),remainingBags:s.quantity%s.packQuantity,
    missing, ready:missing.length===0 && profitPerBag>=0,
  };
}
export function initialPriceSettings(item) {
  const quantity=item.tiers[0].quantity??100;
  return {...emptyPriceSettings,quantity,packQuantity:Math.min(100,quantity),tierQuantity:item.tiers[0].quantity};
}
export function priceBookCsv(items, records) {
  const byId=new Map(records.map(record=>[record.itemId,record]));
  const rows=[['internal_id','product','size_inches','option','supplier_code','PDF_page','quoted_quantity','supplier_cost_per_bag_ex_GST_delivery','saved_selling_per_bag_ex_GST','saved_pack_quantity','review_status','notes']];
  for(const item of items) {
    const record=byId.get(item.id);
    const quote=record?calculatePrice(item,record.settings):null;
    for(const tier of item.tiers) rows.push([item.id,item.name,item.size,item.option,item.code,item.page,tier.quantity??'Not specified',tier.unitCost,quote?.sellingPerBag??'',record?.settings.packQuantity??'',quote?.ready?'Costing complete':'Review needed',record?.settings.notes??'']);
  }
  const escape=value=>'"'+String(value).replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"';
  return '\uFEFF'+rows.map(row=>row.map(escape).join(',')).join('\r\n');
}
