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
  const [loading, setLoading] = useState(false);
  const [configuredProduct, setConfiguredProduct] = useState(product);
  async function chooseOptions() {
    if (loading) return;
    if (product.pricingMode==='variant' && !configuredProduct.variants) {
      setLoading(true);
      try {
        const response = await fetch(`/api/products/${encodeURIComponent(product.slug)}`);
        if (!response.ok) throw new Error('Could not load options. Please try again.');
        const {product:detail} = await response.json();
        if (!detail.variants?.length) throw new Error('Options are unavailable. Open the product page for help.');
        setConfiguredProduct(detail);
        setOpen(true);
      } catch(error) { showToast(error.message,'error'); }
      finally { setLoading(false); }
    } else setOpen(true);
  }
  const { cartItems } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const outOfStock = product.inStock === false;
  const saved = isInWishlist(product.id);
  const selectedUnits = cartItems.filter(item => item.id === product.id).reduce((total, item) => total + item.quantity, 0);
  const firstPrice = product.pricing?.[0]?.pricePerUnit ?? product.basePrice;
  const sizeCount = product.sizes?.length || 1;
  const variantProduct = product.pricingMode==='variant';
  return <article className={styles.card}>
    <div className={styles.imageWrap}>
      <Link href={`/product/${product.slug}`} aria-label={`View ${product.name}`}><Image src={product.image || '/images/category-boxes.jpg'} alt={product.name} fill priority={priority} sizes="(max-width: 600px) 92vw, (max-width: 1000px) 46vw, 24vw" className={styles.image} /></Link>
      {product.packConfirmationRequired ? <span className={styles.badge}>Pack count pending</span> : outOfStock ? <span className={styles.badge}>Out of stock</span> : product.bestSeller && <span className={styles.badge}>Bestseller</span>}
      <button type="button" className={styles.wishlist} aria-label={`${saved ? 'Remove' : 'Save'} ${product.name}`} aria-pressed={saved} onClick={() => { const added = toggleWishlist(product); showToast(added ? 'Saved to your wishlist' : 'Removed from wishlist', 'info'); }}><Heart size={19} fill={saved ? 'currentColor' : 'none'} /></button>
      <button className={styles.quick} type="button" onClick={chooseOptions} disabled={loading || (outOfStock && !variantProduct)} aria-busy={loading} aria-haspopup="dialog" aria-label={`Choose options for ${product.name}`}>{loading?'Loading options…':variantProduct?'Choose size & pack':`Choose ${sizeCount > 1 ? 'size & quantity' : 'quantity'}`}<Plus size={18} /></button>
    </div>
    <div className={styles.content}>
      <span className={styles.type}>{product.type || 'Packaging essential'} · {variantProduct?`${product.variantCount} variants`:`${sizeCount} ${sizeCount===1?'size':'sizes'}`}</span>
      <Link href={`/product/${product.slug}`}><h3>{product.name}</h3></Link>
      <div className={styles.price}><strong>{firstPrice>0?`${variantProduct?'From ':''}${formatMoney(firstPrice)}`:'Price on request'}</strong><span>/ {variantProduct?'selected pack/item':'unit'}</span>{!variantProduct&&<span className={styles.volume}>Volume pricing</span>}</div>
      {selectedUnits > 0 && <Link href="/cart" className={styles.inCart}><Check size={14} /> {selectedUnits} {variantProduct?'packs/items':'units'} in your list</Link>}
    </div>
    {open && <QuickShop product={configuredProduct} onClose={() => setOpen(false)} />}
  </article>;
}
