import Link from 'next/link';
import { Package, ArrowUpRight, MessageCircle } from 'lucide-react';
import { whatsappUrl } from '@/lib/whatsapp';
import styles from './Footer.module.css';

export default function Footer() {
  return <footer className={styles.footer}>
    <div className={`container ${styles.top}`}><div><span>LET’S MAKE EVERY DELIVERY COUNT.</span><h2>Your next great order<br />starts with a better pack.</h2></div><a href={whatsappUrl()} className={styles.chat} target="_blank" rel="noopener noreferrer"><MessageCircle size={19} /> Let’s talk packaging <ArrowUpRight size={19} /></a></div>
    <div className={`container ${styles.grid}`}>
      <div className={styles.brand}><Link href="/" className={styles.logo}><Package size={26} strokeWidth={1.6} /><span>Ecommerce<span>Wale</span><small>PACKAGING THAT MEANS BUSINESS.</small></span></Link><p>Everyday packaging. Thoughtful support.<br />Helping Indian businesses pack their next chapter.</p><span className={styles.location}>Indore, Madhya Pradesh · Shipping across India</span></div>
      <div className={styles.column}><h3>The catalogue</h3><Link href="/shop">All packaging</Link><Link href="/shop?category=courier-bags">Courier bags</Link><Link href="/shop?category=boxes-tapes">Boxes & tapes</Link><Link href="/shop?category=labels-stickers">Labels & stickers</Link><Link href="/shop?category=shredded-paper">Shredded paper</Link></div>
      <div className={styles.column}><h3>Here to help</h3><Link href="/about">Our story</Link><Link href="/contact">Contact us</Link><Link href="/faq">Questions & answers</Link><Link href="/track-order">Track an order</Link><Link href="/policies/refund">Returns & refunds</Link></div>
      <div className={styles.column}><h3>Let’s connect</h3><a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">Chat on WhatsApp <ArrowUpRight size={13} /></a><a href="tel:+919827787080">+91 98277 87080</a><a href="mailto:hello@ecommercewale.in">hello@ecommercewale.in</a><p>Have a size in mind or a big order ahead?<br />We’re a message away.</p></div>
    </div>
    <div className={`container ${styles.bottom}`}><span>© {new Date().getFullYear()} EcommerceWale. All rights reserved.</span><div><Link href="/policies/privacy">Privacy</Link><Link href="/policies/terms">Terms</Link><span>Made for your business.</span></div></div>
  </footer>;
}
