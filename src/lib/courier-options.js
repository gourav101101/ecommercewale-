// A zero-filled supplier code is not a bag count. Never infer it from price.
export function positivePackQuantity(value) {
  if(value==null || !/^\d+$/.test(String(value).trim())) return null;
  const count=Number(value);
  return Number.isSafeInteger(count) && count>0 && count<=999999 ? count : null;
}

export function sourcePackDetails(source, variant, override) {
  const index=source.options.findIndex(option=>/pack|piece/i.test(option.name));
  if(index<0) return {packQuantity:null,packConfirmationRequired:true,packLabel:'Quantity confirmation needed'};
  const value=String(variant[`option${index+1}`] ?? '');
  const count=positivePackQuantity(override?.packQuantity) ?? positivePackQuantity(value);
  const position=source.options[index].values.indexOf(value);
  return {packQuantity:count,packConfirmationRequired:count==null,
    packLabel:count ? `${count.toLocaleString('en-IN')} bags` : `Pack ${position>=0 ? String.fromCharCode(65+position) : 'option'} — quantity pending`};
}

export function courierSizeLabel(value) {
  return String(value).trim().replace(/\s*[*xX×]\s*/g,' × ');
}

export function matchingOptionVariant(product, variant, index, value) {
  const candidates=product.variants.filter(item=>item.values[index]===value);
  return candidates.find(item=>item.values.every((option,position)=>position===index || option===variant?.values[position]))
    || candidates.find(item=>item.available && item.values.slice(0,index).every((option,position)=>option===variant?.values[position]))
    || candidates.find(item=>item.values.slice(0,index).every((option,position)=>option===variant?.values[position]))
    || candidates.find(item=>item.available) || candidates[0];
}
