'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import styles from './page.module.css';
export default function ContactPage() {
  const [formType, setFormType] = useState('general'); // 'general' or 'bulk'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.target);
    const data = {
      formType,
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      message: formData.get('message'),
      ...(formType === 'bulk' && {
        companyName: formData.get('companyName'),
        monthlyVolume: formData.get('monthlyVolume'),
        productsNeeded: formData.get('products')
      })
    };
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) throw new Error('Failed to submit form');
      
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 3000);
      e.target.reset();
    } catch (err) {
      console.error(err);
      alert('Failed to send message. Please try again or contact us via WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.contactPage}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className="container">
          <h1>Contact Us</h1>
          <p>We&apos;re here to help with your packaging needs. Get in touch with our team.</p>
        </div>
      </div>

      <div className={`container ${styles.contactLayout}`}>
        {/* Contact Info & Map */}
        <div className={styles.infoSection}>
          <div className={styles.infoCards}>
            <div className={styles.infoCard}>
              <div className={styles.iconWrap}><Phone size={24} /></div>
              <h3>Call Us</h3>
              <p>+91 98277 87080</p>
              <span>Mon-Sat, 9:00 AM - 6:00 PM</span>
            </div>
            
            <div className={styles.infoCard}>
              <div className={styles.iconWrap}><Mail size={24} /></div>
              <h3>Email Us</h3>
              <p>hello@ecommercewale.in</p>
              <span>We reply within 24 hours</span>
            </div>
            
            <div className={styles.infoCard}>
              <div className={styles.iconWrap}><MapPin size={24} /></div>
              <h3>Visit Us</h3>
              <p>136 Kanak Green, Rewti</p>
              <span>Indore, Madhya Pradesh 452015, India</span>
            </div>
          </div>

          <a
            href="https://www.google.com/maps/search/?api=1&query=136%20Kanak%20Green%2C%20Rewti%2C%20Indore%2C%20Madhya%20Pradesh%20452015%2C%20India"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.mapContainer}
            aria-label="Open our location in Google Maps"
          >
            <iframe
              title="EcommerceWale location in Indore"
              src="https://www.google.com/maps?q=136%20Kanak%20Green%2C%20Rewti%2C%20Indore%2C%20Madhya%20Pradesh%20452015%2C%20India&z=16&output=embed"
              className={styles.mapFrame}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </a>
        </div>

        {/* Form Section */}
        <div className={styles.formSection}>
          <div className={styles.formContainer}>
            <div className={styles.formTabs}>
              <button 
                className={`${styles.tabBtn} ${formType === 'general' ? styles.tabActive : ''}`}
                onClick={() => setFormType('general')}
              >
                General Inquiry
              </button>
              <button 
                className={`${styles.tabBtn} ${formType === 'bulk' ? styles.tabActive : ''}`}
                onClick={() => setFormType('bulk')}
              >
                Bulk Order / Wholesale
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.contactForm}>
              <div className="grid-2">
                <div className="input-group">
                  <label htmlFor="name">Full Name</label>
                  <input type="text" id="name" name="name" required className="input" placeholder="John Doe" />
                </div>
                <div className="input-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input type="tel" id="phone" name="phone" required className="input" placeholder="+91" />
                </div>
              </div>
              
              <div className="input-group">
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" name="email" required className="input" placeholder="john@company.com" />
              </div>

              {formType === 'bulk' && (
                <>
                  <div className="grid-2">
                    <div className="input-group">
                      <label htmlFor="company">Company/Brand Name</label>
                      <input type="text" id="company" name="companyName" required className="input" placeholder="Your Brand" />
                    </div>
                    <div className="input-group">
                      <label htmlFor="monthlyVolume">Monthly Order Volume</label>
                      <select id="monthlyVolume" name="monthlyVolume" className="input">
                        <option value="1000-5000">1,000 - 5,000 units</option>
                        <option value="5000-10000">5,000 - 10,000 units</option>
                        <option value="10000+">10,000+ units</option>
                      </select>
                    </div>
                  </div>
                  <div className="input-group">
                    <label htmlFor="products">Products Needed</label>
                    <input type="text" id="products" name="products" className="input" placeholder="e.g. Courier Bags, Custom Boxes" />
                  </div>
                </>
              )}

              <div className="input-group">
                <label htmlFor="message">Your Message</label>
                <textarea id="message" name="message" required className="input" rows="5" placeholder="How can we help you?"></textarea>
              </div>

              <button 
                type="submit" 
                className={`btn btn-primary btn-lg ${styles.submitBtn} ${isSubmitted ? styles.btnSuccess : ''}`}
                disabled={isSubmitting || isSubmitted}
              >
                {isSubmitting ? (
                  'Sending...'
                ) : isSubmitted ? (
                  'Message Sent!'
                ) : (
                  <>Send Message <Send size={18} /></>
                )}
              </button>
            </form>

            <div className={styles.whatsappPrompt}>
              <p>Need immediate assistance?</p>
              <a href="https://wa.me/919827787080" target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                <MessageCircle size={18} style={{ color: '#25D366' }} /> Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
