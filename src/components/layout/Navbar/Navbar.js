'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, Menu, X, Search, Heart, ArrowUpRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { whatsappUrl } from '@/lib/whatsapp';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { cartItems } = useCart();
  const { wishlistCount } = useWishlist();
  const router = useRouter();
  const pathname = usePathname();
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const searchRef = useRef(null);
  const categoryLinks = [{ href: '/shop', label: 'Shop all' }, { href: '/shop?category=courier-bags', label: 'Courier bags' }, { href: '/shop?category=boxes', label: 'Boxes' }, { href: '/shop?category=tapes', label: 'Tapes' }, { href: '/shop?category=labels', label: 'Labels' }, { href: '/shop?category=shredded-paper', label: 'Finishing touches' }];
  const links = [{ href: '/shop', label: 'Shop' }, { href: '/about', label: 'About' }, { href: '/contact', label: 'Contact' }];
  const closeMenu = () => { menuRef.current?.close(); triggerRef.current?.focus(); };
  const openMenu = () => menuRef.current?.showModal();
  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);
  const search = (event) => { event.preventDefault(); if (query.trim()) { router.push(`/shop?search=${encodeURIComponent(query.trim())}`); setSearchOpen(false); setQuery(''); } };
  const logo = <><Image className={styles.logoIcon} src="/images/brand/logo-circle.webp" alt="" width={38} height={38} /><div className={styles.logoText}><span>Ecommerce<span>Wale</span></span><small>PACKAGING THAT MEANS BUSINESS.</small></div></>;
  return <header className={styles.header}>
    <nav className={`container ${styles.nav}`} aria-label="Main navigation">
      <Link href="/" className={styles.logo} aria-label="EcommerceWale home">{logo}</Link>
      <div className={styles.links}>{links.map((link) => <Link href={link.href} key={link.href} className={pathname === link.href ? styles.active : ''} aria-current={pathname === link.href ? 'page' : undefined}>{link.label}</Link>)}</div>
      <div className={styles.actions}>
        <button onClick={() => setSearchOpen(!searchOpen)} aria-label="Search products" aria-expanded={searchOpen} className={styles.icon}><Search size={19} /></button>
        <Link href="/wishlist" className={`${styles.icon} ${styles.wishlist}`} aria-label={`Wishlist, ${wishlistCount} saved products`}><Heart size={19} />{wishlistCount > 0 && <span className={styles.badge}>{wishlistCount}</span>}</Link>
        <Link href="/cart" className={styles.cart} aria-label={`Order list, ${cartItems.length} product selections`}><ShoppingBag size={19} /><span className={styles.cartLabel}>Your order</span><span className={styles.cartCount}>{cartItems.length}</span></Link>
        <button ref={triggerRef} onClick={openMenu} className={`${styles.icon} ${styles.menuTrigger}`} aria-label="Open navigation menu"><Menu size={22} /></button>
      </div>
    </nav>
    {searchOpen && <div className={styles.search}><form className={`container ${styles.searchForm}`} onSubmit={search}><Search size={19} /><input ref={searchRef} aria-label="Search packaging products" type="search" placeholder="Search bags, boxes, labels…" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Escape') setSearchOpen(false); }} /><button type="submit">Search <ArrowUpRight size={14} /></button><button type="button" aria-label="Close search" onClick={() => setSearchOpen(false)}><X size={20} /></button></form></div>}
    <dialog ref={menuRef} className={styles.menu} onClick={(event) => { if (event.target === event.currentTarget) closeMenu(); }} onClose={() => triggerRef.current?.focus()}>
      <div className={styles.menuHead}><Link href="/" onClick={closeMenu} className={styles.logo}>{logo}</Link><button onClick={closeMenu} aria-label="Close navigation menu" className={styles.icon}><X size={22} /></button></div>
      <nav aria-label="Mobile navigation">{[...categoryLinks, { href: '/about', label: 'Our story' }, { href: '/contact', label: 'Contact & help' }, { href: '/wishlist', label: 'Your wishlist' }, { href: '/track-order', label: 'Track an order' }].map((link) => <Link href={link.href} key={link.href} onClick={closeMenu}>{link.label}<ArrowUpRight size={18} /></Link>)}</nav>
      <Link href="/cart" className="btn btn-primary btn-lg" onClick={closeMenu}><ShoppingBag size={19} /> Your order list ({cartItems.length})</Link>
      <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className={styles.menuHelp}>Need a hand? Chat with us on WhatsApp.</a>
    </dialog>
  </header>;
}
