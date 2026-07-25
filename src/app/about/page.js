import Link from 'next/link';
import { CheckCircle2, ShieldCheck, Factory, Award } from 'lucide-react';
import styles from './page.module.css';

export const metadata = {
  title: 'About Us | EcommerceWale',
  description: 'Learn about EcommerceWale - India\'s leading manufacturer and supplier of e-commerce packaging materials including courier bags, boxes, and tapes.',
};

export default function AboutPage() {
  return (
    <div className={styles.aboutPage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <span className="section-label animate-fadeInUp">Our Story</span>
            <h1 className="animate-fadeInUp delay-1">Empowering India&apos;s E-Commerce Sellers</h1>
            <p className="animate-fadeInUp delay-2">
              We started with a simple mission: to provide high-quality, marketplace-compliant packaging materials at direct-to-manufacturer prices for sellers across India.
            </p>
          </div>
        </div>
      </section>

      {/* Stats/Image Section */}
      <section className="section">
        <div className="container">
          <div className={styles.splitLayout}>
            <div className={styles.imageGrid}>
              <div className={styles.imageMain} style={{ backgroundImage: 'url(/images/category-boxes.jpg)' }}></div>
              <div className={styles.imageSub} style={{ backgroundImage: 'url(/images/product-5ply-box.jpg)' }}></div>
              <div className={styles.imageSub} style={{ backgroundImage: 'url(/images/category-courier-bags.jpg)' }}></div>
            </div>
            
            <div className={styles.textContent}>
              <h2>From Factory to Your Doorstep</h2>
              <p>
                As e-commerce grew in India, we noticed a massive gap. Small and medium sellers were forced to buy packaging materials from local retailers at inflated prices, cutting into their margins.
              </p>
              <p>
                By setting up our own manufacturing facility and operating entirely online, EcommerceWale eliminates the middlemen. We pass those savings directly to you, whether you need 100 bags or 100,000.
              </p>
              
              <div className={styles.statsList}>
                <div className={styles.statItem}>
                  <strong>15,000+</strong>
                  <span>Sq Ft Manufacturing Facility</span>
                </div>
                <div className={styles.statItem}>
                  <strong>2M+</strong>
                  <span>Production Capacity / Day</span>
                </div>
                <div className={styles.statItem}>
                  <strong>100%</strong>
                  <span>ISO Certified Materials</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className={styles.valuesSection}>
        <div className="container">
          <div className="section-header">
            <span className="section-label">Core Values</span>
            <h2>What Drives Us</h2>
          </div>
          
          <div className="grid-4">
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}><Factory size={28} /></div>
              <h3>Manufacturing Excellence</h3>
              <p>We control the quality from raw material to finished product, ensuring every bag and box meets stringent marketplace standards.</p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}><ShieldCheck size={28} /></div>
              <h3>Transparent Pricing</h3>
              <p>No hidden costs, no middleman markups. Our tiered pricing structure means the more you buy, the more you save.</p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}><CheckCircle2 size={28} /></div>
              <h3>Marketplace Compliance</h3>
              <p>We constantly update our product specifications to match the ever-changing packaging guidelines of Amazon, Flipkart, and Meesho.</p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}><Award size={28} /></div>
              <h3>Customer Success</h3>
              <p>Your success is our success. We provide fast shipping and dedicated support so you never run out of packaging during peak sales.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaContent}>
            <h2>Ready to upgrade your packaging?</h2>
            <p>Join 10,000+ sellers who trust EcommerceWale for their daily shipping needs.</p>
            <div className={styles.ctaActions}>
              <Link href="/shop" className="btn btn-primary btn-lg">
                View All Products
              </Link>
              <Link href="/contact" className="btn btn-outline btn-lg" style={{ borderColor: 'white', color: 'white' }}>
                Contact Sales Team
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
