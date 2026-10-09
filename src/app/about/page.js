import Link from 'next/link';
import Image from 'next/image';
import { Package, Layers, MessageCircle, ArrowUpRight } from 'lucide-react';
import { whatsappUrl } from '@/lib/whatsapp';
import styles from './page.module.css';

export const metadata = { title: 'Our story | EcommerceWale', description: 'Everyday packaging and personal support for Indian businesses. Get to know EcommerceWale.', alternates: { canonical: '/about' } };

export default function AboutPage() {
  return <div className="container"><section className={styles.hero}><div><span className={styles.label}>PACKAGING THAT MEANS BUSINESS.</span><h1>Behind every order,<br /><span>there’s a business.</span></h1><p>A first sale. A new launch. Another busy shipping day. Whatever your next chapter looks like, we believe finding the right packaging should be the easy part.</p><Link href="/shop" className="btn btn-primary btn-lg">Find your essentials <ArrowUpRight size={18} /></Link></div><div className={styles.image}><Image src="/images/packaging-campaign.webp" alt="AI-created studio arrangement of packaging essentials" fill sizes="(max-width: 800px) 90vw, 45vw" priority /></div></section>
    <section className={styles.story}><span className={styles.label}>SMALL DETAILS. BIG DIFFERENCE.</span><h2>More than a pack.<br />A practical partner.</h2><div><p>EcommerceWale brings courier bags, corrugated boxes, packing tapes, labels, and fillers together in one catalogue. It’s a simple place to compare options and build an order around what you actually ship.</p><p>We’re based in Indore and work with businesses across India. Browse at your pace, choose your sizes and quantities, and send your list to our team on WhatsApp. We’ll help with the details before you commit.</p></div></section>
    <section className={styles.values}>{[
      [Package, 'The right fit.', 'Clear product dimensions and material details help you choose supplies that suit your shipments.'],
      [Layers, 'Room to grow.', 'Quantity-based pricing makes it easier to compare the cost of your next restock or larger order.'],
      [MessageCircle, 'A real conversation.', 'A team you can reach on WhatsApp for product questions, quotes, and support with your order.'],
    ].map(([Icon, title, text]) => <article key={title}><Icon size={26} strokeWidth={1.3} /><h3>{title}</h3><p>{text}</p></article>)}</section>
    <section className={styles.process}><div className={styles.processImage}><Image src="/images/finishing-editorial.webp" alt="AI-created packaging inspiration with a kraft box and paper filler" fill sizes="(max-width:800px) 92vw, 45vw" /><span>AI-created packaging inspiration</span></div><div className={styles.processCopy}><span className={styles.label}>FROM YOUR SCREEN TO YOUR SHIPPING DESK</span><h2>Simple by design.<br />Personal by choice.</h2><ol>{[['Make it yours.','Find the materials, sizes and quantities that work for what you send.'],['Talk it through.','Send your packing list on WhatsApp. We confirm stock, costs and delivery together.'],['Approve the details.','Only go ahead when you’re happy with the final quote and payment arrangements.']].map(([title,text],index) => <li key={title}><span>0{index+1}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol></div></section>
    <section className={styles.cta}><div><span className={styles.label}>YOUR NEXT SHIPPING DAY STARTS HERE.</span><h2>Let’s find your fit.</h2><p>Tell us what you’re packing. We’ll help you take it from here.</p></div><a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg">Talk to our team <ArrowUpRight size={18} /></a></section>
  </div>;
}
