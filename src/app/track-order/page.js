'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Search, MessageCircle, ArrowRight, Check, Package } from 'lucide-react';
import { whatsappUrl, formatMoney } from '@/lib/whatsapp';
import styles from './page.module.css';

const steps = [['pending','Order recorded'],['processing','Getting ready'],['shipped','On its way'],['delivered','Delivered']];
export default function TrackOrderPage() {
  const [order,setOrder] = useState(null);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState('');
  async function track(event) {
    event.preventDefault(); setLoading(true); setError(''); setOrder(null);
    try {
      const values = Object.fromEntries(new FormData(event.currentTarget));
      const response = await fetch('/api/track-order', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(values)});
      if (!response.ok) throw new Error(response.status===404 ? 'We couldn’t match that order ID and email. Check the details our team shared, or ask us on WhatsApp.' : 'Order lookup is temporarily unavailable. Please try again or ask our team on WhatsApp.');
      setOrder(await response.json());
    } catch (failure) { setError(failure.message || 'Unable to check your order. Please try again.'); }
    finally { setLoading(false); }
  }
  const active = steps.findIndex(([id]) => id===order?.status);
  return <div className={`container ${styles.page}`}>
    <header className={styles.heading}><span>FROM OUR TEAM TO YOUR DOOR</span><h1>Your next delivery.<br />Let’s check in.</h1><p>Ordered through WhatsApp? Your existing conversation is the best place for a personal update.</p></header>
    <div className={styles.layout}><section className={styles.personal}><MessageCircle size={36} strokeWidth={1.2} /><span>WHATSAPP ORDERS</span><h2>A real update.<br />From a real person.</h2><p>Share your confirmed order details with our team. We’ll help with dispatch, delivery timing and any questions along the way.</p><a href={whatsappUrl('Hi EcommerceWale! I would like a delivery update for my confirmed order. My order details are:')} target="_blank" rel="noopener noreferrer">Ask for a delivery update <ArrowRight size={18} /></a><small>Sending an enquiry alone does not create a confirmed order.</small></section>
      <section className={styles.lookup}><span>HAVE AN ORDER ID?</span><h2>Look up your order.</h2><p>Use the order ID and email supplied by our team. These details must match the recorded order.</p><form onSubmit={track}><label htmlFor="orderId">Order ID</label><input className="input" id="orderId" name="orderId" required maxLength={80} placeholder="Your confirmed order ID" /><label htmlFor="email">Email address</label><input className="input" id="email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="The email on your order" /><button className="btn btn-primary" disabled={loading}>{loading ? 'Checking your order…' : 'Check order status'}<Search size={18} /></button>{error && <p className={styles.error} role="alert">{error}</p>}</form></section></div>
    {order && <section className={styles.result} aria-live="polite"><header><div><span>YOUR ORDER</span><h2>{order.id}</h2>{order.date && <p>Recorded {String(order.date).slice(0,10)}</p>}</div><div><strong>{formatMoney(Number(order.total)||0)}</strong><p>{order.products?.length || 0} product selections</p></div></header>{order.status==='cancelled' ? <p className={styles.error}>This order has been cancelled. Contact our team if you need help.</p> : active<0 ? <p>Status: {order.status || 'Please contact our team for an update.'}</p> : <ol className={styles.timeline}>{steps.map(([id,label],index) => <li key={id} aria-current={active===index ? 'step' : undefined} data-complete={index<active}><span>{index<active ? <Check size={20} /> : <Package size={20} />}</span><strong>{label}</strong>{index===active && <small>Current status</small>}</li>)}</ol>}</section>}
    <footer className={styles.help}><span>Still deciding what to order?</span><Link href="/shop">Explore packaging <ArrowRight size={17} /></Link><Link href="/faq">Visit the help centre <ArrowRight size={17} /></Link></footer>
  </div>;
}
