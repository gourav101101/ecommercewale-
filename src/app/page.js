import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight, MessageCircle, Layers, Package } from 'lucide-react';
import { categories } from '@/data/products';
import { getShopProducts } from '@/lib/products';
import { whatsappUrl } from '@/lib/whatsapp';
import ProductCard from '@/components/shop/ProductCard/ProductCard';
import styles from './page.module.css';

export const revalidate = 300;

export default async function Home() {
  const products = await getShopProducts();
  const available = products.filter(product => product.inStock !== false);
  const featured = [...available].sort((a, b) => Number(!!b.bestSeller) - Number(!!a.bestSeller)).slice(0, 8);
  return <div className={styles.home}>
    <section className={styles.hero}>
      <div className={styles.heroCopy}><p>THOUGHTFUL PACKAGING. EVERY DAY.</p><h1>Good products.<br />Beautifully packed.</h1><span>Boxes, bags and finishing touches.<br />For every order that has your name on it.</span><Link href="/shop">Discover the collection <ArrowRight size={21} /></Link></div>
      <div className={styles.heroImage}><Image src="/images/packaging-campaign.webp" alt="Kraft boxes, mailers, labels and packing tape arranged in a warm studio" fill sizes="(max-width: 700px) 100vw, 60vw" priority /></div>
    </section>
    <nav className={`container ${styles.categoryNav}`} aria-label="Explore packaging categories">{categories.map(category => <Link key={category.id} href={`/shop?category=${category.id}`}><span className={styles.categoryThumb}><Image src={category.image} alt="" fill sizes="80px" /></span><span>{category.name}</span><ArrowUpRight size={18} /></Link>)}</nav>
    <section className={`container ${styles.collection}`}>
      <div className={styles.heading}><div><p>THE EVERYDAY EDIT</p><h2>Find your next essential.</h2></div><Link href="/shop">Shop all packaging <ArrowRight size={18} /></Link></div>
      <div className={styles.productGrid}>{featured.map(product => <ProductCard key={product.id} product={product} />)}</div>
      <Link href="/shop" className={styles.allProducts}>Explore the whole collection <ArrowRight size={18} /></Link>
    </section>
    <section className={styles.editorial}>
      <div className={styles.editorialImage}><Image src="/images/category-shredded.jpg" alt="An open kraft box with shredded paper packaging filler" fill sizes="(max-width: 700px) 100vw, 50vw" /></div>
      <div className={styles.editorialCopy}><p>IT’S ALL IN THE DETAILS</p><h2>A good first impression.<br />Before it’s even opened.</h2><span>Make the last step of packing feel like the first step of something special. Explore the finishing touches for your next delivery.</span><Link href="/shop?category=shredded-paper">Discover finishing touches <ArrowRight size={18} /></Link></div>
    </section>
    <section className={`container ${styles.services}`} aria-label="How ordering works">
      <div><Package size={27} strokeWidth={1.3} /><h3>Your product. Your fit.</h3><p>Choose sizes and quantities that work for what you’re sending.</p></div>
      <div><Layers size={27} strokeWidth={1.3} /><h3>Better value as you grow.</h3><p>See quantity pricing before adding anything to your order list.</p></div>
      <div><MessageCircle size={27} strokeWidth={1.3} /><h3>A conversation, not a checkout.</h3><p>Send your list on WhatsApp. We’ll confirm stock, delivery and payment.</p><a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">Talk to our team <ArrowUpRight size={15} /></a></div>
    </section>
  </div>;
}
