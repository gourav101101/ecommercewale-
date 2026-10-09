'use client';

import { useEffect, useRef, useState, useId } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ArrowRight, Check, Minus, Plus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { quantityPrice, validQuantity } from '@/lib/catalogue-pricing';
import { formatMoney } from '@/lib/whatsapp';
import styles from './QuickShop.module.css';
import VariantQuickShop from './VariantQuickShop';

export default function QuickShop({ product, onClose }) {
  if (product.pricingMode==='variant') return <VariantQuickShop product={product} onClose={onClose}/>;
  return <LegacyQuickShop product={product} onClose={onClose}/>;
}

function LegacyQuickShop({ product, onClose }) {
  const dialog = useRef(null);
  const heading = useId();
  const quantityId = useId();
  const { addToCart } = useCart();
  const [size, setSize] = useState(product.sizes?.[0]?.value || null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const valid = validQuantity(quantity);
  const unitPrice = quantityPrice(product.pricing, valid ? Number(quantity) : 1);
  const canOrder = product.inStock !== false && product.pricing?.length > 0;

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current.showModal();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, []);

  function submit(event) {
    event.preventDefault();
    if (!valid || !canOrder) return;
    addToCart(product, size, Number(quantity));
    setAdded(true);
  }

  return <dialog ref={dialog} className={styles.dialog} aria-labelledby={heading} onClose={onClose} onClick={event => { if (event.target === event.currentTarget) dialog.current.close(); }}>
    <div className={styles.panel}>
      <header className={styles.header}><span>{added ? 'Your order is taking shape' : 'Make it yours'}</span><button type="button" aria-label="Close product options" onClick={() => dialog.current.close()}><X size={23} /></button></header>
      <div className={styles.product}><div className={styles.image}><Image src={product.image || '/images/category-boxes.jpg'} alt={product.name} fill sizes="140px" /></div><div><span>{product.type}</span><h2 id={heading}>{product.name}</h2><Link href={`/product/${product.slug}`}>View full details <ArrowRight size={15} /></Link></div></div>
      {added ? <section className={styles.success} aria-live="polite"><Check size={30} /><h3>Added to your order list.</h3><p>{quantity} units{size ? ` · ${product.sizes?.find(item => item.value === size)?.label || size}` : ''}. Your list is saved on this device.</p><Link href="/cart" className={styles.primary}>Review your order <ArrowRight size={18} /></Link><button className={styles.continue} onClick={() => dialog.current.close()}>Continue exploring</button><p className={styles.note}>Nothing is purchased yet. Send your list on WhatsApp when you’re ready for a confirmed quote.</p></section> :
        <form onSubmit={submit}>
          {!!product.sizes?.length && <fieldset className={styles.sizes}><legend>1. Choose your size</legend><div>{product.sizes.map(option => <label key={option.value}><input type="radio" name={heading} value={option.value} checked={size === option.value} onChange={() => setSize(option.value)} /><span>{option.label}</span></label>)}</div></fieldset>}
          <div className={styles.quantity}><label htmlFor={quantityId}>{product.sizes?.length ? '2.' : '1.'} Choose your quantity</label><div className={styles.stepper}><button type="button" aria-label="Decrease order quantity" disabled={Number(quantity) <= 1} onClick={() => setQuantity(Math.max(1, Number(quantity) - 1))}><Minus size={18} /></button><input id={quantityId} aria-label="Order quantity" type="number" min="1" max="999999" step="1" required value={quantity} onChange={event => setQuantity(event.target.value)} /><button type="button" aria-label="Increase order quantity" disabled={Number(quantity) >= 999999} onClick={() => setQuantity(Number(quantity) + 1)}><Plus size={18} /></button></div></div>
          <div className={styles.tiers}><p>More units. Better value.</p>{product.pricing?.map(tier => <button type="button" key={tier.minQty} onClick={() => setQuantity(tier.minQty)} aria-pressed={valid && Number(quantity) >= tier.minQty && (!tier.maxQty || Number(quantity) <= tier.maxQty)}><span>{tier.label || `${tier.minQty}+ units`}</span><strong>{formatMoney(tier.pricePerUnit)} <small>/ unit</small></strong></button>)}</div>
          <div className={styles.purchase}><div className={styles.total}><div><span>Estimated item total</span><strong>{formatMoney(unitPrice * (valid ? Number(quantity) : 0))}</strong></div><p>{formatMoney(unitPrice)} per unit · GST & delivery confirmed in your quote.</p></div>
          <button type="submit" disabled={!canOrder || !valid} className={styles.primary}>{canOrder ? 'Add to order list' : 'Currently unavailable'}<Plus size={19} /></button>
          <p className={styles.note}>Confirm availability and payment on WhatsApp.</p></div>
        </form>}
    </div>
  </dialog>;
}
