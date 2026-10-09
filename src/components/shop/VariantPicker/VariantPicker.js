'use client';
import { useId } from 'react';
import { matchingOptionVariant, courierSizeLabel } from '@/lib/courier-options';
import { formatMoney } from '@/lib/whatsapp';
import styles from './VariantPicker.module.css';

export default function VariantPicker({ product, variant, onChange }) {
  const prefix=useId();
  const courier=product.category==='courier-bags';
  const choose=(index,value)=>{
    const match=matchingOptionVariant(product,variant,index,value);
    if(match) onChange(match.id);
  };
  return <div className={styles.options}>{product.options.map((option,index)=>{
    const pack=courier && option.name==='Pack';
    const choices=option.values.flatMap(value=>{
      if(!pack) return [{value,label:courier && option.name==='Size'?courierSizeLabel(value):value}];
      const match=matchingOptionVariant(product,variant,index,value);
      if(!match || !match.values.every((item,position)=>position===index || item===variant?.values[position])) return [];
      return [{value,label:`${match.packLabel || 'Quantity pending'} · ${match.price>0?formatMoney(match.price):'Price on request'}${!match.available?' · unavailable':''}`}];
    });
    return <div className={styles.option} key={`${index}-${option.name}`}>
      <label htmlFor={`${prefix}-${index}`}>{pack?'Pack (bags)':option.name}</label>
      <select id={`${prefix}-${index}`} aria-label={`Select ${option.name.toLowerCase()}`} value={variant?.values[index] || ''} onChange={event=>choose(index,event.target.value)}>
        {choices.map(({value,label})=><option key={value} value={value}>{label}</option>)}
      </select>
    </div>;
  })}</div>;
}
