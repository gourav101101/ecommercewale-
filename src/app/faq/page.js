'use client';

import { useState } from 'react';
import { Search, ChevronDown, MessageCircle } from 'lucide-react';
import { faqData } from '@/data/admin';
import styles from './page.module.css';

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (categoryId, qIndex) => {
    const key = `${categoryId}-${qIndex}`;
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredFaqs = faqData.map((category, catIndex) => {
    const filteredQuestions = category.questions.filter(
      q => 
        q.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
        q.a.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...category, id: catIndex, questions: filteredQuestions };
  }).filter(cat => cat.questions.length > 0);

  return (
    <div className={styles.faqPage}>
      <div className={styles.faqHeader}>
        <div className="container">
          <h1 className="animate-fadeInUp">Frequently Asked Questions</h1>
          <p className="animate-fadeInUp delay-1">
            Find answers to common questions about our products, shipping, and policies.
          </p>
          
          <div className={`${styles.searchBox} animate-fadeInUp delay-2`}>
            <Search size={20} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search for answers..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container section">
        <div className={styles.faqLayout}>
          {/* Sidebar Navigation */}
          <div className={styles.faqSidebar}>
            <h3>Categories</h3>
            <ul className={styles.categoryList}>
              {faqData.map((cat, i) => (
                <li key={i}>
                  <a href={`#cat-${i}`} className={styles.categoryLink}>
                    {cat.category}
                  </a>
                </li>
              ))}
            </ul>

            <div className={styles.contactSupport}>
              <h4>Still have questions?</h4>
              <p>We&apos;re here to help you.</p>
              <a href="https://wa.me/919827787080" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                <MessageCircle size={18} /> Chat with Support
              </a>
            </div>
          </div>

          {/* FAQ Content */}
          <div className={styles.faqContent}>
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((category) => (
                <div key={`cat-${category.id}`} id={`cat-${category.id}`} className={styles.faqCategory}>
                  <h2>{category.category}</h2>
                  <div className={styles.accordion}>
                    {category.questions.map((item, qIndex) => {
                      const key = `${category.id}-${qIndex}`;
                      const isOpen = openItems[key];
                      
                      return (
                        <div key={qIndex} className={`${styles.accordionItem} ${isOpen ? styles.open : ''}`}>
                          <button 
                            className={styles.accordionHeader}
                            onClick={() => toggleItem(category.id, qIndex)}
                          >
                            <h3>{item.q}</h3>
                            <div className={styles.iconWrap}>
                              <ChevronDown size={20} />
                            </div>
                          </button>
                          <div className={styles.accordionBody}>
                            <div className={styles.accordionContent}>
                              <p>{item.a}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noResults}>
                <Search size={48} />
                <h3>No answers found</h3>
                <p>We couldn&apos;t find any questions matching &quot;{searchQuery}&quot;</p>
                <button 
                  className="btn btn-outline" 
                  onClick={() => setSearchQuery('')}
                  style={{ marginTop: '1rem' }}
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
