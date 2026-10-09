// Private commercial records. Never include purchase costs/margins in public
// product payloads. These records do not calculate a tax or delivery surcharge.
export function validateCommercialSettings(input, sellingPrice) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid commercial details.');
  const number = (key,max,integer=false) => {
    const value=input[key];
    if(value==='' || value==null) return null;
    if(typeof value!=='number' && typeof value!=='string') throw new Error(`Invalid ${key}.`);
    const result=Number(value);
    if(!Number.isFinite(result) || result<0 || result>max || (integer ? !Number.isInteger(result) : Math.abs(result*100-Math.round(result*100))>0.000001)) throw new Error(`Invalid ${key}: use a non-negative ${integer?'whole number':'number with up to two decimals'}.`);
    return result;
  };
  const text = (key,max) => {
    if(input[key]!=null && typeof input[key]!=='string') throw new Error(`Invalid ${key}.`);
    const value=(input[key] || '').trim();
    if(value.length>max) throw new Error(`${key} is too long.`);
    return value;
  };
  const flag = key => {
    if(typeof input[key]!=='boolean') throw new Error(`Confirm ${key} as true or false.`);
    return input[key];
  };
  const result={purchaseCost:number('purchaseCost',10000000),targetMargin:number('targetMargin',100),
    stockQuantity:number('stockQuantity',999999999,true),gstHsn:text('gstHsn',8),gstRate:number('gstRate',100),
    gstTreatment:input.gstTreatment || 'pending',deliveryRule:text('deliveryRule',500),deliveryCharge:number('deliveryCharge',10000000),
    confirmed:flag('confirmed'),notes:text('notes',1000)};
  if(result.gstHsn && !/^(\d{4}|\d{6}|\d{8})$/.test(result.gstHsn)) throw new Error('HSN must have 4, 6 or 8 digits.');
  if(!['pending','inclusive','exclusive'].includes(result.gstTreatment)) throw new Error('Choose a valid GST price treatment.');
  if(result.confirmed && (sellingPrice==null || result.purchaseCost==null || result.stockQuantity==null || !result.gstHsn || result.gstRate==null || result.gstTreatment==='pending' || !result.deliveryRule || result.deliveryCharge==null)) throw new Error('Before confirming, enter selling price, purchase cost, stock, HSN, GST rate/treatment and delivery rule/charge. Zero delivery charge is allowed when genuinely free.');
  return result;
}
