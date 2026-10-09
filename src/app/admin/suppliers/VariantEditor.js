'use client';
import { useState } from 'react';
import styles from './page.module.css';
import CommercialFields, { commercialFormValues } from './CommercialFields';

export default function VariantEditor({productId,variant,enabled}) {
  const [price,setPrice]=useState(variant.sellingPrice??'');
  const [available,setAvailable]=useState(variant.storeAvailable);
  const [packQuantity,setPackQuantity]=useState(variant.confirmedPackQuantity??'');
  const [commercial,setCommercial]=useState(()=>commercialFormValues(variant.commercial));
  const changeCommercial=(key,value)=>{setCommercial(previous=>({...previous,[key]:value,confirmed:key==='confirmed'?value:false}));setStatus('Unsaved changes');};
  const [saving,setSaving]=useState(false);
  const [status,setStatus]=useState('');
  async function save(event) {
    event.preventDefault();if(saving)return;setSaving(true);setStatus('');
    try {
      const response=await fetch('/api/admin/supplier-catalogue',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({productId,variantId:variant.id,sellingPrice:price===''?null:Number(price),available,commercial,...(variant.isCourierBag ? {packQuantity:packQuantity===''?null:Number(packQuantity)} : {})})});
      const data=await response.json();if(!response.ok)throw new Error(data.error||'Could not save.');
      setCommercial(commercialFormValues(data.commercial));
      setStatus(data.commercial?.confirmed?'Saved as owner-confirmed.':'Saved. Commercial confirmation still pending.');
    } catch(error) {setStatus(error.message);}
    finally {setSaving(false);}
  }
  return <form className={styles.editor} onSubmit={save}><label>Selling price / selected pack<input aria-label={`Store price for ${variant.title}`} type="number" min="0.01" max="10000000" step="0.01" placeholder={`Source: ${variant.price}`} value={price} onChange={event=>{setPrice(event.target.value);changeCommercial('confirmed',false);}} disabled={!enabled||saving}/></label><label><input type="checkbox" checked={available} onChange={event=>{setAvailable(event.target.checked);setStatus('Unsaved changes');}} disabled={!enabled||saving}/> Allow quote selection</label>{variant.isCourierBag&&<label>Confirmed bags per pack<input aria-label={`Confirmed bags per pack for ${variant.title}`} type="number" min="1" max="999999" step="1" placeholder={variant.packQuantity?String(variant.packQuantity):'Enter verified bag count'} value={packQuantity} onChange={event=>{setPackQuantity(event.target.value);changeCommercial('confirmed',false);}} disabled={!enabled||saving}/><small>{variant.packConfirmationRequired?'Supplier quantity is incomplete. Verify the bag count, enter it here and save. Do not infer it from the price.':'Optional correction after supplier verification. Blank uses the valid source count.'}</small></label>}<CommercialFields value={commercial} onChange={changeCommercial} disabled={!enabled||saving}/><button disabled={!enabled||saving}>{saving?'Saving…':'Save variant & details'}</button><small>Blank price uses the supplier reference. Saves require MongoDB.</small><span role="status">{status}</span></form>;
}
