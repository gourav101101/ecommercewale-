'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import OrderJourney from '@/components/shop/OrderJourney/OrderJourney';
import { MessageCircle, ArrowLeft, Check, Copy, ExternalLink } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatMoney, orderMessage, whatsappUrl } from '@/lib/whatsapp';
import styles from './page.module.css';

export default function CheckoutPage() {
  const { cartItems, subtotal, isLoaded } = useCart();
  const [customer, setCustomer] = useState({ name: '', company: '', phone: '', pincode: '', notes: '' });
  const [message, setMessage] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const update = (event) => setCustomer((previous) => ({ ...previous, [event.target.name]: event.target.value }));
  const submit = (event) => {
    event.preventDefault();
    const text = orderMessage(cartItems, customer, subtotal);
    setMessage(text);
    window.open(whatsappUrl(text), '_blank', 'noopener,noreferrer');
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(message); setCopyStatus('Order details copied'); }
    catch { setCopyStatus('Copy unavailable. Select the message below to copy it manually.'); }
  };
  if (!isLoaded) return <div className="container section" role="status">Loading your order list…</div>;
  if (!cartItems.length) return <div className={`container ${styles.empty}`}><MessageCircle size={40} /><h1>Let’s build your order.</h1><p>Choose your packaging first, then we’ll help with the rest.</p><Link href="/shop" className="btn btn-primary">Explore packaging</Link></div>;
  return <div className={`container ${styles.page}`}>
    <OrderJourney step={2} />
    <Link href="/cart" className={styles.back}><ArrowLeft size={16} /> Back to your order list</Link>
    <div className={styles.pageHeading}><div><span className={styles.label}>A QUOTE, NOT A COMMITMENT</span><h1>One step closer.<br />Let’s talk details.</h1></div><p className={styles.intro}>Share your order on WhatsApp. We’ll confirm availability, final pricing, and delivery before you pay.</p></div>
    <div className={styles.layout}>
      <form onSubmit={submit} className={styles.form}>
        <h2>A few details to get started.</h2><p>We’ll use these to prepare your quote. Your details are shared when you send the WhatsApp message.</p>
        <div className={styles.fields}>
          <div className="input-group"><label htmlFor="order-name">Your name</label><input id="order-name" name="name" autoComplete="name" className="input" required minLength={2} maxLength={100} value={customer.name} onChange={update} /></div>
          <div className="input-group"><label htmlFor="order-phone">Phone number</label><input id="order-phone" name="phone" autoComplete="tel-national" className="input" type="tel" inputMode="tel" pattern="[6-9][0-9]{9}" title="Enter a 10-digit Indian mobile number" placeholder="10-digit mobile number" required maxLength={10} value={customer.phone} onChange={update} /></div>
          <div className="input-group"><label htmlFor="order-company">Business name <span>(optional)</span></label><input id="order-company" name="company" autoComplete="organization" className="input" maxLength={120} value={customer.company} onChange={update} /></div>
          <div className="input-group"><label htmlFor="order-pincode">Delivery pincode</label><input id="order-pincode" name="pincode" autoComplete="postal-code" className="input" inputMode="numeric" pattern="[1-9][0-9]{5}" title="Enter a valid 6-digit Indian pincode" maxLength={6} required value={customer.pincode} onChange={update} /></div>
          <div className={`input-group ${styles.full}`}><label htmlFor="order-notes">Anything else we should know? <span>(optional)</span></label><textarea id="order-notes" name="notes" rows={3} className="input" maxLength={1000} placeholder="GST invoice, delivery requirements, or a question about your order…" value={customer.notes} onChange={update} /></div>
        </div>
        <button type="submit" className={`btn btn-primary btn-lg ${styles.submit}`}><MessageCircle size={20} /> Send order enquiry on WhatsApp <ExternalLink size={16} /></button>
        <div className={styles.note}><Check size={16} /><span>No online payment is taken. Your order is confirmed only after our team agrees the details with you.</span></div>
        {message && <div className={styles.recovery}><h3>Your message is ready.</h3><p>If WhatsApp didn’t open, use the link below or copy your enquiry. Your cart stays saved.</p><div className={styles.recoveryActions}><a href={whatsappUrl(message)} target="_blank" rel="noopener noreferrer" className="btn btn-outline">Open WhatsApp <ExternalLink size={16} /></a><button type="button" onClick={copy} className="btn btn-outline"><Copy size={16} /> Copy enquiry</button></div><p role="status">{copyStatus}</p><details><summary>View your enquiry</summary><pre>{message}</pre></details></div>}
      </form>
      <aside className={styles.summary}><div className={styles.summaryHeading}><h2>Your packing list</h2><Link href="/cart">Edit list</Link></div><p>{cartItems.length} product {cartItems.length === 1 ? 'selection' : 'selections'}</p><div className={styles.items}>{cartItems.map((item) => <div key={`${item.id}-${item.selectedSize}`}><div className={styles.itemImage}><Image src={item.image || '/images/category-boxes.jpg'} alt="" fill sizes="64px" /></div><div className={styles.itemInfo}><strong>{item.name}</strong><span>{item.sizeLabel || 'Standard'} · {item.quantity} {item.pricingMode==='variant'?'selected packs/items':'units'} × {formatMoney(item.pricePerUnit)}</span><strong>{formatMoney(item.quantity * item.pricePerUnit)}</strong></div></div>)}</div><div className={styles.total}><span>Estimated subtotal</span><strong>{formatMoney(subtotal)}</strong></div><div className={styles.quoteNote}>Supplier-listed prices are reference estimates. Our team confirms availability, final pricing, GST and delivery charges in your quote.</div><div className={styles.next}><span>WHAT HAPPENS NEXT</span><p>1. Send your enquiry in WhatsApp.</p><p>2. We confirm stock, pricing, and delivery.</p><p>3. You approve the quote and arrange payment with our team.</p></div></aside>
    </div>
  </div>;
}
