import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, ShieldCheck, CheckCircle2, Package, Box, Tag, Scissors } from 'lucide-react';
import { categories } from '@/data/products';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { stats, usps, testimonials } from '@/data/testimonials';
import { marketplaces } from '@/data/marketplace';
import ProductCard from '@/components/shop/ProductCard/ProductCard';
import ScrollReveal from '@/components/ui/ScrollReveal/ScrollReveal';
import styles from './page.module.css';

const categoryIcons = {
  'courier-bags': Package,
  'boxes-tapes': Box,
  'labels-stickers': Tag,
  'shredded-paper': Scissors,
};

export default async function Home() {
  await dbConnect();
  const rawBestSellers = await Product.find({ bestSeller: true }).sort({ createdAt: -1 }).limit(4);
  const bestSellers = JSON.parse(JSON.stringify(rawBestSellers));

  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <div className={`section-label animate-fadeInUp ${styles.heroLabel}`}>
              Trusted by 10,000+ Sellers
            </div>
            <h1 className="animate-fadeInUp delay-1">
              India&apos;s #1 Packaging Partner for <span className={styles.highlight}>E-Commerce Sellers</span>
            </h1>
            <p className="animate-fadeInUp delay-2">
              Wholesale courier bags, corrugated boxes, packaging tapes, and thermal labels. Direct from manufacturer pricing with Pan-India delivery.
            </p>
            <div className={`${styles.heroActions} animate-fadeInUp delay-3`}>
              <Link href="/shop" className="btn btn-primary btn-lg">
                Shop Packaging <ArrowRight size={20} />
              </Link>
              <Link href="/contact" className="btn btn-outline btn-lg">
                Bulk Order Inquiry
              </Link>
            </div>
            
            <div className={`${styles.marketplaceTrusted} animate-fadeInUp delay-4`}>
              <p>Packaging compliant with all major marketplaces</p>
              <div className={styles.marketplaceLogos}>
                {marketplaces.map((mp) => (
                  <span 
                    key={mp.id} 
                    className="badge" 
                    style={{ backgroundColor: `${mp.color}15`, color: mp.color, fontSize: 'var(--text-xs)' }}
                  >
                    {mp.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.heroBg}>
          <div className={styles.blob1}></div>
          <div className={styles.blob2}></div>
        </div>
      </section>

      {/* Trust Marquee */}
      <div className={styles.trustMarquee}>
        <div className={styles.marqueeContent}>
          {[...Array(2)].map((_, idx) => (
            <div key={idx} className={styles.marqueeTrack}>
              <span>100% Quality Assured</span>
              <span className={styles.dot}>•</span>
              <span>Pan India Delivery</span>
              <span className={styles.dot}>•</span>
              <span>Direct Manufacturer</span>
              <span className={styles.dot}>•</span>
              <span>Wholesale Pricing</span>
              <span className={styles.dot}>•</span>
              <span>Marketplace Compliant</span>
              <span className={styles.dot}>•</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <section className={styles.stats}>
        <div className="container">
          <div className="grid-4">
            {stats.map((stat, i) => (
              <ScrollReveal key={i} animation="fadeInUp" delay={i * 0.1}>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>
                    {stat.value}{stat.suffix}
                  </div>
                  <div className={styles.statLabel}>{stat.label}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section">
        <div className="container">
          <ScrollReveal>
            <div className="section-header">
              <span className="section-label">Our Products</span>
              <h2>Shop by Category</h2>
              <p>Everything you need to pack and ship your products securely.</p>
            </div>
          </ScrollReveal>
          
          <div className="grid-4">
            {categories.map((category, i) => (
              <ScrollReveal key={category.id} delay={i * 0.1}>
                <Link href={`/shop?category=${category.slug}`} className={styles.categoryCard}>
                  <div className={styles.categoryIcon} style={{ background: `linear-gradient(135deg, ${category.color}, ${category.color}dd)` }}>
                    {(() => { const Icon = categoryIcons[category.id] || Package; return <Icon size={24} />; })()}
                  </div>
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                  <div className={styles.categoryLink} style={{ color: category.color }}>
                    Explore <ArrowRight size={16} />
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="section" style={{ background: 'var(--color-bg-alt)' }}>
        <div className="container">
          <ScrollReveal>
            <div className="section-header">
              <span className="section-label">Top Rated</span>
              <h2>Best Sellers</h2>
              <p>Our most popular packaging products chosen by thousands of sellers.</p>
            </div>
          </ScrollReveal>
          
          <div className="grid-4">
            {bestSellers.map((product, i) => (
              <ScrollReveal key={product.id} delay={i * 0.1}>
                <ProductCard product={product} />
              </ScrollReveal>
            ))}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
            <Link href="/shop" className="btn btn-outline">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className={`section ${styles.usps}`}>
        <div className="container">
          <ScrollReveal>
            <div className="section-header">
              <span className="section-label">Why EcommerceWale</span>
              <h2>The Smart Choice for Smart Sellers</h2>
              <p>We solve the packaging problems so you can focus on growing your business.</p>
            </div>
          </ScrollReveal>

          <div className="grid-3">
            {usps.map((usp, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className={styles.uspCard}>
                  <div className={styles.uspIcon}>
                    <CheckCircle2 size={24} />
                  </div>
                  <h3>{usp.title}</h3>
                  <p>{usp.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section">
        <div className="container">
          <ScrollReveal>
            <div className="section-header">
              <span className="section-label">Testimonials</span>
              <h2>Loved by Sellers Across India</h2>
              <p>Don&apos;t just take our word for it. Here is what our customers have to say.</p>
            </div>
          </ScrollReveal>

          <div className={styles.testimonialGrid}>
            {testimonials.map((testimonial, i) => (
              <ScrollReveal key={testimonial.id} delay={i * 0.1}>
                <div className={styles.testimonialCard}>
                  <div className="star-rating">
                    {[...Array(testimonial.rating)].map((_, idx) => (
                      <Star key={idx} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <p className={styles.testimonialText}>&quot;{testimonial.text}&quot;</p>
                  <div className={styles.testimonialAuthor}>
                    <div className={styles.authorAvatar}>{testimonial.avatar}</div>
                    <div>
                      <div className={styles.authorName}>{testimonial.name}</div>
                      <div className={styles.authorRole}>{testimonial.role}, {testimonial.company}</div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// Simple icon component for category cards
function PackageIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
      <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
  );
}
