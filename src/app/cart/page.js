'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Minus, Plus, Trash2, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import styles from './page.module.css';

export default function CartPage() {
  const { 
    cartItems, 
    cartCount, 
    subtotal, 
    gstAmount, 
    shippingCost, 
    totalAmount, 
    removeFromCart, 
    updateQuantity,
    isLoaded
  } = useCart();
  
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (coupon.trim().toLowerCase() === 'first10') {
      setCouponApplied(true);
    }
  };

  const discountAmount = couponApplied ? subtotal * 0.10 : 0;
  const finalTotal = totalAmount - discountAmount;

  if (!isLoaded) {
    return <div className="container section">Loading cart...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <div className={styles.emptyIcon}>🛒</div>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven&apos;t added any packaging supplies yet.</p>
        <Link href="/shop" className="btn btn-primary btn-lg">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.cartPage}>
      <div className="container">
        <h1 className={styles.pageTitle}>Shopping Cart ({cartCount} items)</h1>

        <div className={styles.cartLayout}>
          {/* Cart Items List */}
          <div className={styles.cartItems}>
            <div className={styles.cartHeader}>
              <div className={styles.colProduct}>Product</div>
              <div className={styles.colPrice}>Price</div>
              <div className={styles.colQty}>Quantity</div>
              <div className={styles.colTotal}>Total</div>
              <div className={styles.colAction}></div>
            </div>

            <div className={styles.cartList}>
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.selectedSize}`} className={styles.cartItemRow}>
                  <div className={styles.colProduct}>
                    <div className={styles.itemImage} style={{ backgroundImage: `url(${item.image})` }} />
                    <div className={styles.itemInfo}>
                      <Link href={`/product/${item.slug}`} className={styles.itemName}>
                        {item.name}
                      </Link>
                      {item.selectedSize && (
                        <div className={styles.itemSize}>Size: {item.sizeLabel}</div>
                      )}
                      
                      {/* Bulk saving indicator */}
                      {item.pricing.length > 1 && item.quantity >= item.pricing[1].minQty && (
                        <div className={styles.bulkSavingBadge}>
                          <Tag size={12} />
                          Bulk discount applied!
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.colPrice}>
                    <div className={styles.itemPrice}>₹{item.pricePerUnit.toFixed(2)}</div>
                    {item.pricePerUnit < item.pricing[0].pricePerUnit && (
                      <div className={styles.itemOriginalPrice}>
                        ₹{item.pricing[0].pricePerUnit.toFixed(2)}
                      </div>
                    )}
                  </div>

                  <div className={styles.colQty}>
                    <div className={styles.qtyControl}>
                      <button 
                        className={styles.qtyBtn}
                        onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        type="number"
                        min="1"
                        className={styles.qtyInput}
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) && val > 0) {
                            updateQuantity(item.id, item.selectedSize, val);
                          }
                        }}
                      />
                      <button 
                        className={styles.qtyBtn}
                        onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <div className={styles.colTotal}>
                    <div className={styles.itemTotal}>
                      ₹{(item.pricePerUnit * item.quantity).toFixed(2)}
                    </div>
                  </div>

                  <div className={styles.colAction}>
                    <button 
                      className={styles.removeBtn}
                      onClick={() => removeFromCart(item.id, item.selectedSize)}
                      aria-label="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.cartFooter}>
              <Link href="/shop" className={styles.continueLink}>
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className={styles.orderSummary}>
            <h3>Order Summary</h3>
            
            <div className={styles.summaryList}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>GST (18%)</span>
                <span>₹{gstAmount.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span>{shippingCost === 0 ? <span className={styles.freeLabel}>Free</span> : `₹${shippingCost.toFixed(2)}`}</span>
              </div>
              
              {shippingCost > 0 && (
                <div className={styles.shippingNotice}>
                  Add ₹{(2000 - subtotal).toFixed(2)} more to get free shipping!
                </div>
              )}

              {couponApplied && (
                <div className={`${styles.summaryRow} ${styles.discountRow}`}>
                  <span>Discount (FIRST10)</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className={styles.summaryTotal}>
                <span>Total</span>
                <span>₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <form className={styles.couponForm} onSubmit={handleApplyCoupon}>
              <input 
                type="text" 
                placeholder="Promo code (try FIRST10)" 
                className={styles.couponInput}
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                disabled={couponApplied}
              />
              <button 
                type="submit" 
                className={`btn ${couponApplied ? 'btn-outline' : 'btn-secondary'}`}
                disabled={couponApplied}
              >
                {couponApplied ? 'Applied' : 'Apply'}
              </button>
            </form>

            <Link href="/checkout" className={`btn btn-primary btn-lg ${styles.checkoutBtn}`}>
              Proceed to Checkout <ArrowRight size={20} />
            </Link>

            <div className={styles.secureCheckout}>
              <ShieldCheck size={16} className={styles.secureIcon} />
              <span>Secure Checkout. GST Invoice provided.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
