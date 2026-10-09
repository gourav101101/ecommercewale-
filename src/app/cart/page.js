'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, ArrowRight, ArrowLeft, ShoppingBag, MessageCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatMoney } from '@/lib/whatsapp';
import OrderJourney from '@/components/shop/OrderJourney/OrderJourney';
import styles from './page.module.css';

export default function CartPage() {
  const { cartItems, cartCount, subtotal, removeFromCart, updateQuantity, isLoaded } = useCart();
  if (!isLoaded) return <div className="container section" role="status">Loading your order list…</div>;
  return <div className={`container ${styles.page}`}><OrderJourney step={1} />
    <header className={styles.heading}><div><span>READY FOR YOUR NEXT SHIPPING DAY</span><h1>Your order list.</h1></div><p>{cartItems.length ? `${cartItems.length} product selections. ${cartCount.toLocaleString('en-IN')} ordered packs/items or units, as labelled below. Final pricing confirmed on WhatsApp.` : 'A little preparation. A better delivery. Start with the essentials your business needs.'}</p></header>
    {!cartItems.length ? <div className={styles.empty}><ShoppingBag size={42} strokeWidth={1} /><h2>Good things start here.</h2><p>Choose your packaging, sizes and quantities. We’ll help with the rest.</p><Link href="/shop" className="btn btn-primary btn-lg">Explore packaging <ArrowRight size={18} /></Link></div> : <div className={styles.layout}>
      <section aria-label="Your selected products" className={styles.items}>{cartItems.map(item => {
        const nextTier = item.pricing?.find(tier => tier.minQty > item.quantity && tier.pricePerUnit < item.pricePerUnit);
        return <article key={`${item.id}-${item.selectedSize}`} className={styles.item}>
          <Link href={`/product/${item.slug}`} className={styles.image}><Image src={item.image || '/images/category-boxes.jpg'} alt={item.name} fill sizes="(max-width:600px) 100px, 160px" /></Link>
          <div className={styles.itemContent}><div className={styles.itemHeading}><div><Link href={`/product/${item.slug}`}><h2>{item.name}</h2></Link><p>{item.sizeLabel || 'Standard'} <span>· {formatMoney(item.pricePerUnit)} / {item.priceUnit || 'unit'}</span></p>{item.pricingMode==='variant'&&<p>Quantity below counts complete selected packs/items. Variant: {item.variantId}</p>}</div><strong>{formatMoney(item.quantity*item.pricePerUnit)}</strong></div>
            <div className={styles.itemActions}><div className={styles.quantity}><button onClick={() => updateQuantity(item.id,item.selectedSize,item.quantity-1)} disabled={item.quantity<=1} aria-label={`Decrease ${item.name} quantity`}><Minus size={16} /></button><input type="number" min="1" max="1000000" aria-label={`Quantity of ${item.name}`} value={item.quantity} onChange={event => {const value=Number.parseInt(event.target.value,10);if(value>0 && value<=1000000)updateQuantity(item.id,item.selectedSize,value);}} /><button onClick={() => updateQuantity(item.id,item.selectedSize,item.quantity+1)} aria-label={`Increase ${item.name} quantity`}><Plus size={16} /></button></div><button className={styles.remove} onClick={() => removeFromCart(item.id,item.selectedSize)} aria-label={`Remove ${item.name}`}>Remove</button></div>
            {nextTier && <button className={styles.priceBreak} onClick={() => updateQuantity(item.id,item.selectedSize,nextTier.minQty)}>Choose {nextTier.minQty} units for {formatMoney(nextTier.pricePerUnit)} each <ArrowRight size={15} /></button>}
          </div>
        </article>;
      })}<Link className={styles.continue} href="/shop"><ArrowLeft size={17} /> Keep exploring</Link></section>
      <aside className={styles.summary}><span className={styles.eyebrow}>THE NEXT STEP</span><h2>Let’s make it happen.</h2><p>Your list is a starting point. Our team confirms the details before you commit.</p><dl><div><dt>Products</dt><dd>{formatMoney(subtotal)}</dd></div><div><dt>GST & delivery</dt><dd>Confirmed in quote</dd></div></dl><div className={styles.total}><span>Estimated subtotal</span><strong>{formatMoney(subtotal)}</strong></div><Link href="/checkout" className={`btn btn-primary ${styles.checkout}`}>Request WhatsApp quote <ArrowRight size={18} /></Link><div className={styles.reassurance}><MessageCircle size={19} /><span>No online payment. A real person helps finalise your order.</span></div><Link href="/faq" className={styles.questions}>Questions about ordering?</Link></aside>
    </div>}
  </div>;
}
