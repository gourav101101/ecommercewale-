'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { Star, Minus, Plus, ShoppingCart, CheckCircle2, Package, Tag, ArrowLeft, AlertTriangle, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { whatsappUrl, formatMoney } from '@/lib/whatsapp';
import ProductCard from '@/components/shop/ProductCard/ProductCard';
import styles from './page.module.css';
import Link from 'next/link';

export default function ProductDetailPage({ initialProduct, initialRelatedProducts }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  
  const [product, setProduct] = useState(initialProduct);
  const [relatedProducts] = useState(initialRelatedProducts);

  const [selectedSizeOverride, setSelectedSizeOverride] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('specs');
  
  // Review form state
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState('5');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const reviewCount = product.reviews?.length || 0;
  const reviewAverage = reviewCount ? product.reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviewCount : 0;

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${product.slug}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: reviewName, rating: reviewRating, comment: reviewComment })
      });
      if (!res.ok) throw new Error('Failed to submit review');
      const data = await res.json();
      setProduct({
        ...product,
        rating: data.product.rating,
        reviewCount: data.product.reviewCount,
        reviews: data.product.reviews
      });
      showToast('Review submitted successfully!', 'success');
      setReviewName('');
      setReviewComment('');
      setReviewRating('5');
    } catch (error) {
      showToast('Error submitting review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };
  
  const selectedSize = product.sizes.some((size) => size.value === selectedSizeOverride)
    ? selectedSizeOverride
    : product.sizes[0]?.value || null;

  const calculateCurrentPrice = (pricing, quantity) => {
    if (!pricing || pricing.length === 0) return product.basePrice || 0;
    // Sort by minQty descending
    const sorted = [...pricing].sort((a, b) => b.minQty - a.minQty);
    for (let i = 0; i < sorted.length; i++) {
      if (quantity >= sorted[i].minQty) {
        return sorted[i].pricePerUnit;
      }
    }
    return sorted[sorted.length - 1].pricePerUnit;
  };

  const currentPrice = calculateCurrentPrice(product.pricing, quantity);
  const totalAmount = currentPrice * quantity;

  const isOutOfStock = product.inStock === false;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedSize, quantity);
    showToast('Added to your order list', 'success');
  };

  const handleQuantityChange = (e) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val > 0) {
      setQuantity(val);
    }
  };

  return (
    <div className={styles.productPage}>
      <div className="container">
        <div className={styles.breadcrumb}>
          <Link href="/shop" className={styles.backLink}>
            <ArrowLeft size={16} /> Back to Shop
          </Link>
          <span className={styles.separator}>/</span>
          <span className={styles.categoryName}>{product.category.replace('-', ' ')}</span>
          <span className={styles.separator}>/</span>
          <span className={styles.currentName}>{product.name}</span>
        </div>

        <div className={styles.productMain}>
          {/* Gallery */}
          <div className={styles.gallery}>
            <div 
              className={styles.mainImage}
            >
              <Image src={product.gallery?.[currentImageIndex] || product.image} alt={product.name} fill sizes="(max-width: 850px) 92vw, 50vw" priority style={{ objectFit: 'contain' }} />
              {product.bestSeller && <div className={styles.badge}>Best Seller</div>}
            </div>
            
            {product.gallery && product.gallery.length > 1 && (
              <div className={styles.thumbnailStrip}>
                {product.gallery.map((img, index) => (
                  <button
                    key={index}
                    className={`${styles.thumbnail} ${index === currentImageIndex ? styles.thumbnailActive : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                    style={{ backgroundImage: `url(${img})` }}
                    aria-label={`View image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className={styles.details}>
            <div className={styles.header}>
              <span className={styles.typeLabel}>{product.type}</span>
              <h1 className={styles.title}>{product.name}</h1>
              
              {reviewCount > 0 ? <div className={styles.ratingRow}>
                <div className="star-rating">
                  {[...Array(Math.max(0, Math.min(5, Math.floor(reviewAverage))))].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                  {reviewAverage % 1 !== 0 && (
                    <Star size={16} fill="currentColor" style={{ clipPath: 'inset(0 50% 0 0)' }} />
                  )}
                </div>
                <span className={styles.ratingText}>{reviewAverage.toFixed(1)}</span>
                <span className={styles.reviewCount}>({reviewCount} reviews)</span>
              </div> : <span className={styles.reviewCount}>An everyday packaging essential</span>}
            </div>

            <div className={styles.priceSection}>
              <div className={styles.priceCurrent}>
                <span className={styles.currency}>₹</span>
                <span className={styles.amount}>{currentPrice.toFixed(2)}</span>
                <span className={styles.unit}>/ unit</span>
              </div>
              <p className={styles.priceNote}>Catalogue estimate · GST and delivery confirmed in your quote</p>
            </div>

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className={styles.selectionGroup}>
                <div className={styles.selectionHeader}>
                  <h3 className={styles.selectionTitle}>Select Size</h3>
                  <span className={styles.selectionValue}>
                    {product.sizes.find(s => s.value === selectedSize)?.dimensions}
                  </span>
                </div>
                <div className={styles.sizeGrid}>
                  {product.sizes.map((size) => (
                    <button
                      key={size.value}
                      className={`${styles.sizePill} ${selectedSize === size.value ? styles.sizeActive : ''}`}
                      aria-pressed={selectedSize === size.value}
                      onClick={() => setSelectedSizeOverride(size.value)}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Bulk Pricing */}
            <div className={styles.selectionGroup}>
              <div className={styles.selectionHeader}>
                <h3 className={styles.selectionTitle}>Quantity</h3>
              </div>
              
              <div className={styles.quantityWrapper}>
                <div className={styles.quantityControl}>
                  <button 
                    className={styles.qtyBtn} 
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus size={18} />
                  </button>
                  <input
                    type="number"
                    min="1"
                    className={styles.qtyInput}
                    aria-label="Order quantity"
                    value={quantity}
                    onChange={handleQuantityChange}
                  />
                  <button 
                    className={styles.qtyBtn}
                    aria-label="Increase quantity"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus size={18} />
                  </button>
                </div>
                
                <div className={styles.totalCalc}>
                  Total: <strong>₹{totalAmount.toFixed(2)}</strong>
                </div>
              </div>
            </div>

            {/* Tiered Pricing Table */}
            <div className={styles.bulkPricingBox}>
              <div className={styles.bulkHeader}>
                <Tag size={16} /> <span>Bulk Discount Pricing</span>
              </div>
              <div className={styles.bulkTable}>
                {product.pricing && product.pricing.map((tier, idx) => {
                  const isCurrentTier = 
                    quantity >= tier.minQty && 
                    (tier.maxQty === null || quantity <= tier.maxQty);
                    
                  return (
                    <div 
                      key={idx} 
                      className={`${styles.bulkRow} ${isCurrentTier ? styles.bulkRowActive : ''}`}
                    >
                      <span>{tier.label}</span>
                      <strong>₹{tier.pricePerUnit.toFixed(2)} /pc</strong>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add to Cart */}
            <div className={styles.actionGroup}>
              {isOutOfStock && (
                <div className={styles.outOfStockNotice}>
                  <AlertTriangle size={18} />
                  <span>This product is currently out of stock</span>
                </div>
              )}
              <button 
                className={`btn btn-primary btn-lg ${styles.addToCartBtn}`}
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                style={isOutOfStock ? { opacity: 0.5, cursor: 'not-allowed', filter: 'grayscale(1)' } : {}}
              >
                <ShoppingCart size={20} />
                {isOutOfStock ? 'Out of Stock' : 'Add to order list'}
              </button>
              <a className="btn btn-outline btn-lg" href={whatsappUrl(`Hi EcommerceWale! Please quote for ${product.name}.\nSize: ${selectedSize || 'Standard'}\nQuantity: ${quantity}\nCatalogue estimate: ${formatMoney(totalAmount)} before GST and delivery.\nProduct: https://www.ecommercewale.in/product/${product.slug}\nPlease confirm availability and final price.`)} target="_blank" rel="noopener noreferrer"><MessageCircle size={19} /> Ask about this product</a>
              
              <div className={styles.trustSignals}>
                <div className={styles.trustItem}>
                  <CheckCircle2 size={16} className={styles.trustIcon} />
                  <span>GST Invoice Available</span>
                </div>
                <div className={styles.trustItem}>
                  <Package size={16} className={styles.trustIcon} />
                  <span>Delivery estimate in your quote</span>
                </div>
              </div>
            </div>
            
            {/* Marketplace Fit */}
            {product.marketplaceCompatible && (
              <div className={styles.marketplaces}>
                <span>Marketplace Compatible:</span>
                <div className={styles.mpIcons}>
                  {product.marketplaceCompatible.map(mp => (
                    <span key={mp} className={`${styles.mpBadge} ${styles[mp]}`}>
                      {mp}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs Content */}
        <div className={styles.tabsSection}>
          <div className={styles.tabList}>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'specs' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('specs')}
            >
              Specifications
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'features' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('features')}
            >
              Features
            </button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'specs' && (
              <div className="animate-fadeIn">
                <p className={styles.tabDesc}>{product.description}</p>
                <div className={styles.specsGrid}>
                  {product.specs && Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className={styles.specItem}>
                      <span className={styles.specKey}>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className={styles.specValue}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="animate-fadeIn">
                <ul className={styles.featuresList}>
                  {product.features && product.features.map((feature, i) => (
                    <li key={i}>
                      <CheckCircle2 size={18} className={styles.featureIcon} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Customer Reviews Section */}
        <section className="section" style={{ marginTop: '2rem' }}>
          <div className="section-header">
            <h2>Customer Reviews</h2>
          </div>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px' }}>
              <div style={{ background: 'var(--color-bg-alt)', padding: '2rem', borderRadius: '12px' }}>
                <h3 style={{ marginTop: 0 }}>Write a Review</h3>
                <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="input-group">
                    <label htmlFor="review-rating">Rating</label>
                    <select id="review-rating" value={reviewRating} onChange={e => setReviewRating(e.target.value)} className="input" required>
                      <option value="5">5 Stars - Excellent</option>
                      <option value="4">4 Stars - Good</option>
                      <option value="3">3 Stars - Average</option>
                      <option value="2">2 Stars - Poor</option>
                      <option value="1">1 Star - Terrible</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label htmlFor="review-name">Name</label>
                    <input id="review-name" type="text" autoComplete="name" maxLength={100} value={reviewName} onChange={e => setReviewName(e.target.value)} className="input" required />
                  </div>
                  <div className="input-group">
                    <label htmlFor="review-comment">Review</label>
                    <textarea id="review-comment" rows="4" maxLength={2000} value={reviewComment} onChange={e => setReviewComment(e.target.value)} className="input" required></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            </div>
            <div style={{ flex: '2 1 500px' }}>
              {product.reviews && product.reviews.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {product.reviews.slice().reverse().map((rev, idx) => (
                    <div key={idx} style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <strong>{rev.userName}</strong>
                        <span style={{ color: '#FFB800' }}>{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</span>
                      </div>
                      <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>{rev.comment}</p>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                        {new Date(rev.date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--color-bg-alt)', borderRadius: '12px' }}>
                  <p>No reviews yet. Be the first to review this product!</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="section">
            <div className="section-header">
              <h2>You Might Also Need</h2>
            </div>
            <div className={styles.relatedGrid}>
              {relatedProducts.map((rp) => (
                <ProductCard key={rp.id} product={rp} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
