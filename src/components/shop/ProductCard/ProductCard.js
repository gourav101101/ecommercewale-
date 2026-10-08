'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Plus, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';
import { formatMoney } from '@/lib/whatsapp';
import styles from './ProductCard.module.css';

const QuickShop = dynamic(() => import('../QuickShop/QuickShop'), { ssr: false });

export default function ProductCard({ product, priority = false }) {
  const [open, setOpen] = useState(false);
  const { cartItems } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const outOfStock = product.inStock === false;
  const saved = isInWishlist(product.id);
  const selectedUnits = cartItems.filter(item => item.id === product.id).reduce((total, item) => total + item.quantity, 0);
  const firstPrice = product.pricing?.[0]?.pricePerUnit ?? product.basePrice;
  const sizeCount = product.sizes?.length || 1;
  return <article className={styles.card}>
    <div className={styles.imageWrap}>
      <Link href={`/product/${product.slug}`} aria-label={`View ${product.name}`}><Image src={product.image || '/images/category-boxes.jpg'} alt={product.name} fill priority={priority} sizes="(max-width: 600px) 92vw, (max-width: 1000px) 46vw, 24vw" className={styles.image} /></Link>
      {outOfStock ? <span className={styles.badge}>Out of stock</span> : product.bestSeller && <span className={styles.badge}>Bestseller</span>}
      <button type="button" className={styles.wishlist} aria-label={`${saved ? 'Remove' : 'Save'} ${product.name}`} aria-pressed={saved} onClick={() => { const added = toggleWishlist(product); showToast(added ? 'Saved to your wishlist' : 'Removed from wishlist', 'info'); }}><Heart size={19} fill={saved ? 'currentColor' : 'none'} /></button>
      <button className={styles.quick} type="button" onClick={() => setOpen(true)} disabled={outOfStock} aria-haspopup="dialog" aria-label={`Choose options for ${product.name}`}>Choose {sizeCount > 1 ? 'size & quantity' : 'quantity'}<Plus size={18} /></button>
    </div>
    <div className={styles.content}>
      <span className={styles.type}>{product.type || 'Packaging essential'} · {sizeCount} {sizeCount === 1 ? 'size' : 'sizes'}</span>
      <Link href={`/product/${product.slug}`}><h3>{product.name}</h3></Link>
      <div className={styles.price}><strong>{formatMoney(firstPrice)}</strong><span>/ unit</span><span className={styles.volume}>Volume pricing</span></div>
      {selectedUnits > 0 && <Link href="/cart" className={styles.inCart}><Check size={14} /> {selectedUnits} units in your list</Link>}
    </div>
    {open && <QuickShop product={product} onClose={() => setOpen(false)} />}
  </article>;
}
