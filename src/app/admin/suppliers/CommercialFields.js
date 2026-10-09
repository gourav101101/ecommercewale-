'use client';
import { useId } from 'react';
import styles from './page.module.css';

export const emptyCommercial={purchaseCost:'',targetMargin:'',stockQuantity:'',gstHsn:'',gstRate:'',gstTreatment:'pending',deliveryRule:'',deliveryCharge:'',confirmed:false,notes:''};
export function commercialFormValues(value) {
  return Object.fromEntries(Object.entries({...emptyCommercial,...value}).map(([key,item])=>[key,item??emptyCommercial[key]??'']));
}

export default function CommercialFields({value,onChange,disabled}) {
  const id=useId();
  const numeric=(key,label,max,step='0.01')=><label htmlFor={`${id}-${key}`}>{label}<input id={`${id}-${key}`} type="number" min="0" max={max} step={step} value={value[key]} onChange={event=>onChange(key,event.target.value)}/></label>;
  return <details className={styles.commercial}><summary>Costs, stock, GST & delivery</summary><fieldset disabled={disabled}><legend>Private commercial records</legend>
    {numeric('purchaseCost','Purchase cost / selected pack (INR)',10000000)}
    {numeric('targetMargin','Target margin (%) — record only',100)}
    <small>Costs and margins stay private. No selling price is calculated automatically.</small>
    {numeric('stockQuantity','Verified owned stock (complete packs/items)',999999999,'1')}
    <small>Stock is a record, not an inventory reservation. Quote selection is controlled separately.</small>
    <label htmlFor={`${id}-hsn`}>HSN<input id={`${id}-hsn`} inputMode="numeric" maxLength={8} value={value.gstHsn} onChange={event=>onChange('gstHsn',event.target.value)}/></label>
    {numeric('gstRate','Confirmed GST rate (%)',100)}
    <label htmlFor={`${id}-gst`}>GST treatment of selling price<select id={`${id}-gst`} value={value.gstTreatment} onChange={event=>onChange('gstTreatment',event.target.value)}><option value="pending">Not confirmed</option><option value="inclusive">GST included</option><option value="exclusive">GST extra</option></select></label>
    <label htmlFor={`${id}-delivery`}>Delivery rule / destination scope<textarea id={`${id}-delivery`} maxLength={500} placeholder="Specify destination and pack quantity covered by this charge" value={value.deliveryRule} onChange={event=>onChange('deliveryRule',event.target.value)}/></label>
    {numeric('deliveryCharge','Delivery charge for this rule (INR)',10000000)}
    <small>GST and delivery are records for quoting, not automatic additions to the order estimate. Leave unknown values blank, not zero.</small>
    <label htmlFor={`${id}-notes`}>Commercial notes<textarea id={`${id}-notes`} maxLength={1000} value={value.notes} onChange={event=>onChange('notes',event.target.value)}/></label>
    <label><input type="checkbox" checked={value.confirmed} onChange={event=>onChange('confirmed',event.target.checked)}/> I have confirmed these commercial details</label>
    {value.stockVerifiedAt&&<small>Stock recorded: {new Date(value.stockVerifiedAt).toLocaleString('en-IN')}</small>}
  </fieldset></details>;
}
