'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, X, ArrowRight, Plus } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';
import { formatMoney } from '@/lib/whatsapp';
import styles from './page.module.css';
const QuickShop = dynamic(() => import('@/components/shop/QuickShop/QuickShop'), {ssr:false});

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, isLoaded } = useWishlist();
  const { showToast } = useToast();
  const [selected,setSelected] = useState(null);
  const [loading,setLoading] = useState(null);
  async function choose(item) {
    if (loading) return;
    setLoading(item.id);
    try {
      const response = await fetch(`/api/products/${item.slug}`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      setSelected(data.product);
    } catch { showToast('Could not load this product. Please try again or contact our team.', 'error'); }
    finally { setLoading(null); }
  }
  if (!isLoaded) return <div className="container section" role="status">Loading your saved collection…</div>;
  return <div className={`container ${styles.page}`}><header className={styles.heading}><div><span>GOOD FINDS. KEPT CLOSE.</span><h1>Your saved collection.</h1></div><p>{wishlistItems.length ? `${wishlistItems.length} favourites to come back to. Choose your size and quantity whenever you’re ready.` : 'Keep the packaging you like in one place. Your next packing list starts here.'}</p></header>
    {!wishlistItems.length ? <section className={styles.empty}><Heart size={42} strokeWidth={1} /><h2>Save a little inspiration.</h2><p>Tap the heart on any product to keep it here. Saved on this browser, ready for your next visit.</p><Link href="/shop" className="btn btn-primary btn-lg">Find your essentials <ArrowRight size={18} /></Link></section> : <><div className={styles.grid}>{wishlistItems.map(item => <article key={item.id} className={styles.card}><div className={styles.image}><Link href={`/product/${item.slug}`}><Image src={item.image || '/images/category-boxes.jpg'} alt={item.name} fill sizes="(max-width:600px) 92vw, (max-width:1000px) 46vw, 30vw" /></Link><button aria-label={`Remove ${item.name} from wishlist`} onClick={() => removeFromWishlist(item.id)}><X size={19} /></button></div><span className={styles.type}>{item.category?.replaceAll('-',' ')}</span><Link href={`/product/${item.slug}`}><h2>{item.name}</h2></Link><p><strong>{Number(item.basePrice)>0 ? `${item.pricingMode==='variant'?'From ':''}${formatMoney(Number(item.pricing?.[0]?.pricePerUnit ?? item.basePrice ?? item.bulkPrice))}` : 'Price on request'}</strong><span> / {item.pricingMode==='variant'?'selected pack/item':'unit'} · estimate</span></p><button className={styles.choose} aria-haspopup="dialog" disabled={Boolean(loading)} onClick={() => choose(item)}>{loading===item.id ? 'Loading options…' : item.pricingMode==='variant'?'Choose size & pack':'Choose size & quantity'}<Plus size={18} /></button></article>)}</div><div className={styles.bottom}><span>Saved in this browser. Prices and availability are checked when you open product options.</span><Link href="/shop">Keep exploring <ArrowRight size={17} /></Link></div></>}
    {selected && <QuickShop product={selected} onClose={() => setSelected(null)} />}
  </div>;
}
