'use client';

import Link from 'next/link';
import { Package, Mail, Phone, MapPin, ArrowRight, Camera, Send, MessageCircle, Play } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      {/* Top CTA */}
      <div className={styles.ctaBanner}>
        <div className="container">
          <div className={styles.ctaInner}>
            <div className={styles.ctaText}>
              <h3>Ready to Scale Your Packaging?</h3>
              <p>Get wholesale prices on all packaging materials. Free shipping on orders above ₹2,000.</p>
            </div>
            <Link href="/shop" className="btn btn-primary btn-lg">
              Shop Now <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className={styles.footerMain}>
        <div className="container">
          <div className={styles.footerGrid}>
            {/* Brand */}
            <div className={styles.footerBrand}>
              <Link href="/" className={styles.footerLogo}>
                <div className={styles.logoIcon}>
                  <Package size={22} />
                </div>
                <div>
                  <span className={styles.logoBrand}>Ecommerce</span>
                  <span className={styles.logoAccent}>Wale</span>
                </div>
              </Link>
              <p className={styles.brandDesc}>
                India&apos;s trusted one-stop shop for e-commerce packaging supplies. 
                Courier bags, boxes, tapes, labels & more at wholesale prices.
              </p>
              
              <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Subscribe to Newsletter</h4>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    style={{ flex: 1, padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', outline: 'none' }}
                  />
                  <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                    Subscribe
                  </button>
                </div>
              </div>

              <div className={styles.socialLinks}>
                <a href="#" className={styles.socialLink} aria-label="Instagram"><Camera size={18} /></a>
                <a href="#" className={styles.socialLink} aria-label="Twitter"><Send size={18} /></a>
                <a href="#" className={styles.socialLink} aria-label="Facebook"><MessageCircle size={18} /></a>
                <a href="#" className={styles.socialLink} aria-label="Youtube"><Play size={18} /></a>
              </div>
            </div>

            {/* Quick Links */}
            <div className={styles.footerCol}>
              <h4>Quick Links</h4>
              <Link href="/shop">All Products</Link>
              <Link href="/shop?category=courier-bags">Courier Bags</Link>
              <Link href="/shop?category=boxes-tapes">Boxes & Tapes</Link>
              <Link href="/shop?category=labels-stickers">Labels & Stickers</Link>
              <Link href="/shop?category=shredded-paper">Shredded Paper</Link>
            </div>

            {/* Company */}
            <div className={styles.footerCol}>
              <h4>Company</h4>
              <Link href="/about">About Us</Link>
              <Link href="/contact">Contact Us</Link>
              <Link href="/faq">FAQ</Link>
              <Link href="/track-order">Track Order</Link>
              <Link href="/policies/privacy">Privacy Policy</Link>
              <Link href="/policies/terms">Terms & Conditions</Link>
              <Link href="/policies/refund">Refund Policy</Link>
              <Link href="/admin/login">Admin Portal</Link>
            </div>

            {/* Contact */}
            <div className={styles.footerCol}>
              <h4>Contact Us</h4>
              <div className={styles.contactItem}>
                <Phone size={16} />
                <span>+91 98277 87080</span>
              </div>
              <div className={styles.contactItem}>
                <Mail size={16} />
                <span>hello@ecommercewale.in</span>
              </div>
              <div className={styles.contactItem}>
                <MapPin size={16} />
                <span>Indore, Madhya Pradesh 452015, India</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.footerBottom}>
        <div className="container">
          <div className={styles.bottomInner}>
            <p>© {currentYear} EcommerceWale.in — All rights reserved.</p>
            <p>Made with ❤️ for Indian e-commerce sellers</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
