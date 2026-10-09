'use client';
import { useEffect,useRef,useState,useId } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X,ArrowRight,Check,Plus,Minus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatMoney } from '@/lib/whatsapp';
import { validQuantity } from '@/lib/catalogue-pricing';
import { variantOrderable } from '@/lib/supplier-products';
import VariantPicker from '../VariantPicker/VariantPicker';
import CourierPackSummary from '../SupplierProduct/CourierPackSummary';
import styles from './QuickShop.module.css';

export default function VariantQuickShop({product,onClose}) {
  const dialog=useRef(null);
  const heading=useId();
  const quantityId=useId();
  const [variantId,setVariantId]=useState((product.variants.find(variantOrderable)||product.variants[0])?.id);
  const [quantity,setQuantity]=useState(1);
  const [added,setAdded]=useState(false);
  const {addToCart}=useCart();
  const variant=product.variants.find(item=>item.id===variantId);
  const valid=validQuantity(quantity);
  const available=product.inStock!==false&&variantOrderable(variant);
  useEffect(()=>{const focus=document.activeElement;const overflow=document.body.style.overflow;document.body.style.overflow='hidden';dialog.current.showModal();return()=>{document.body.style.overflow=overflow;if(focus instanceof HTMLElement)focus.focus();};},[]);
  return <dialog ref={dialog} className={styles.dialog} aria-labelledby={heading} onClose={onClose} onClick={event=>{if(event.target===event.currentTarget)dialog.current.close();}}><div className={styles.panel}>
    <header className={styles.header}><span>Choose the exact pack</span><button aria-label="Close product options" onClick={()=>dialog.current.close()}><X size={23}/></button></header>
    <div className={styles.product}><div className={styles.image}><Image src={variant.image||product.image} alt={product.name} fill sizes="140px"/></div><div><span>Supplier collection</span><h2 id={heading}>{product.name}</h2><Link href={`/product/${product.slug}`}>View all details <ArrowRight size={15}/></Link></div></div>
    {added?<section className={styles.success} aria-live="polite"><Check size={30}/><h3>Added to your order list.</h3><p>{variant.title} · {quantity} pack(s)/item(s).</p><Link href="/cart" className={styles.primary}>Review your order <ArrowRight size={18}/></Link><button className={styles.continue} onClick={()=>dialog.current.close()}>Continue exploring</button><p className={styles.note}>Your selected variant and pack price are saved. Final quote on WhatsApp.</p></section>:<form onSubmit={event=>{event.preventDefault();if(!valid||!available)return;addToCart(product,variant.id,Number(quantity));setAdded(true);}}>
      <VariantPicker product={product} variant={variant} onChange={setVariantId}/>
      <CourierPackSummary product={product} variant={variant} quantity={quantity}/>
      <div className={styles.quantity}><label htmlFor={quantityId}>Number of packs/items</label><div className={styles.stepper}><button type="button" aria-label="Decrease order quantity" disabled={Number(quantity)<=1} onClick={()=>setQuantity(Math.max(1,Number(quantity)-1))}><Minus size={18}/></button><input id={quantityId} aria-label="Order quantity" type="number" min="1" max="999999" step="1" required value={quantity} onChange={event=>setQuantity(event.target.value)}/><button type="button" aria-label="Increase order quantity" disabled={Number(quantity)>=999999} onClick={()=>setQuantity(Number(quantity)+1)}><Plus size={18}/></button></div></div>
      <details className={styles.imageDisclosure}><summary>About these images</summary><p>{product.visualDisclosure}</p></details>
      <div className={styles.purchase}><div className={styles.total}><div><span>Price per pack/item</span><strong data-testid="variant-price">{variant.price>0?formatMoney(variant.price):'Price on request'}</strong></div><p data-testid="variant-title">{variant.title}</p><p data-testid="variant-total">Total estimate: {valid&&variant.price>0?formatMoney(variant.price*Number(quantity)):'—'}</p></div><button type="submit" className={styles.primary} disabled={!available||!valid}>{available?'Add to order list':variant.packConfirmationRequired?'Confirm pack quantity first':'Currently unavailable'}<Plus size={19}/></button><p className={styles.note}>Complete packs/items. Final price, GST & delivery in your WhatsApp quote.</p></div>
    </form>}
  </div></dialog>;
}
