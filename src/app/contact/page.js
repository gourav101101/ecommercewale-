'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Phone, MapPin, MessageCircle, ArrowUpRight, Copy } from 'lucide-react';
import Instagram from '@/components/ui/InstagramIcon';
import { whatsappUrl } from '@/lib/whatsapp';
import styles from './page.module.css';

export default function ContactPage() {
  const [ready, setReady] = useState('');
  const [copied, setCopied] = useState('');
  const submit = (event) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const message = `Hi EcommerceWale!\nEnquiry: ${values.get('type')}\nName: ${values.get('name')}\nBusiness: ${values.get('company') || 'Not specified'}\n\n${values.get('message')}`;
    setReady(message);
    window.open(whatsappUrl(message), '_blank', 'noopener,noreferrer');
  };
  const copy = async () => { try { await navigator.clipboard.writeText(ready); setCopied('Message copied.'); } catch { setCopied('Please select the message below and copy it manually.'); } };
  return <div className={`container ${styles.page}`}>
    <span className={styles.label}>REAL PEOPLE. PRACTICAL ANSWERS.</span><h1>Let’s talk<br /><span>about your next order.</span></h1><p className={styles.intro}>A question about sizes, a bigger order, or just getting started? We’re here to help you find your fit.</p>
    <nav className={styles.routes} aria-label="Choose your support route"><a href="#packaging-enquiry"><span>01 / PRODUCT ADVICE</span><strong>Find your fit.</strong><p>Sizes, materials and quantities.</p><ArrowUpRight size={22} /></a><Link href="/track-order"><span>02 / EXISTING ORDERS</span><strong>Check your delivery.</strong><p>Updates on an order you’ve placed.</p><ArrowUpRight size={22} /></Link><Link href="/faq"><span>03 / QUICK ANSWERS</span><strong>A little clarity.</strong><p>Ordering, pricing and common questions.</p><ArrowUpRight size={22} /></Link></nav>
    <div className={styles.layout} id="packaging-enquiry">
      <div className={styles.info}>
        <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className={styles.feature}><MessageCircle size={25} /><h2>A message away.</h2><p>Get help with product selection, bulk quotes, and order enquiries on WhatsApp.</p><span>Start a conversation <ArrowUpRight size={17} /></span></a>
        <a href="tel:+919827787080" className={styles.contact}><Phone size={18} /><div><span>GIVE US A CALL</span><strong>+91 98277 87080</strong></div><ArrowUpRight size={16} /></a>
        <a href="https://www.instagram.com/ecommercewale.in/" target="_blank" rel="noopener noreferrer" className={styles.contact}><Instagram size={18} /><div><span>FOLLOW ALONG</span><strong>@ecommercewale.in</strong></div><ArrowUpRight size={16} /></a>
        <div className={styles.contact}><MapPin size={18} /><div><span>BASED IN INDORE</span><strong>Madhya Pradesh, India</strong><p>Serving businesses across India.</p></div></div>
      </div>
      <form onSubmit={submit} className={styles.form}><h2>What are you packing?</h2><p>Share a few details. We’ll prepare your message for WhatsApp.</p>
        <div className="input-group"><label htmlFor="contact-type">I’m looking for</label><select className="input" name="type" id="contact-type"><option>Help choosing packaging</option><option>A bulk order quote</option><option>Support with an existing order</option><option>Samples or custom packaging</option></select></div>
        <div className={styles.fields}><div className="input-group"><label htmlFor="contact-name">Your name</label><input id="contact-name" name="name" className="input" autoComplete="name" required minLength={2} maxLength={100} /></div><div className="input-group"><label htmlFor="contact-company">Business <span>(optional)</span></label><input id="contact-company" name="company" className="input" autoComplete="organization" maxLength={120} /></div></div>
        <div className="input-group"><label htmlFor="contact-message">Tell us a little more</label><textarea className="input" id="contact-message" name="message" rows={5} required minLength={5} maxLength={1500} placeholder="Your products, sizes, quantities, delivery pincode, or questions…" /></div>
        <button type="submit" className="btn btn-primary btn-lg"><MessageCircle size={18} /> Continue on WhatsApp <ArrowUpRight size={17} /></button><small>You’ll review and send your message in WhatsApp. No payment is taken here.</small>
        {ready && <div className={styles.recovery}><p>Your message is ready. If WhatsApp didn’t open:</p><a href={whatsappUrl(ready)} className="btn btn-outline" target="_blank" rel="noopener noreferrer">Open WhatsApp <ArrowUpRight size={14} /></a><button type="button" onClick={copy} className="btn btn-outline"><Copy size={14} /> Copy message</button><p role="status">{copied}</p><details><summary>View message</summary><pre>{ready}</pre></details></div>}
      </form>
    </div>
  </div>;
}
