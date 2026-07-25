'use client';

import Link from 'next/link';
import { Heart, Trash2, ShoppingCart, ArrowRight, Minus, Plus } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import styles from './page.module.css';

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, isLoaded } = useWishlist();
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
  const { showToast } = useToast();

  const handleAddToCart = async (product) => {
    try {
      const res = await fetch(`/api/products/${product.slug}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      const fullProduct = data.product;
      addToCart(fullProduct, fullProduct.sizes?.[0]?.value || 'standard', 1);
      showToast(fullProduct.name + ' added to cart', 'success');
    } catch {
      showToast('This product is no longer available.', 'error');
    }
  };

  const handleQuantityChange = (item, quantity) => {
    const selectedSize = item.sizes?.[0]?.value || 'standard';
    if (quantity < 1) {
      removeFromCart(item.id, selectedSize);
    } else {
      updateQuantity(item.id, selectedSize, quantity);
    }
  };

  if (!isLoaded) {
    return <div className="container section">Loading wishlist...</div>;
  }

  return (
    <div className={styles.wishlistPage}>
      <div className={styles.pageHeader}>
        <div className="container">
          <h1>My Wishlist</h1>
          <p>Items you&apos;ve saved for later</p>
        </div>
      </div>

      <div className="container section">
        {wishlistItems.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconWrap}>
              <Heart size={48} className={styles.emptyIcon} />
            </div>
            <h2>Your wishlist is empty</h2>
            <p>You haven&apos;t saved any items yet. Start exploring our packaging supplies!</p>
            <Link href="/shop" className="btn btn-primary btn-lg">
              Explore Products <ArrowRight size={20} />
            </Link>
          </div>
        ) : (
          <div className={styles.wishlistGrid}>
            {wishlistItems.map((item) => {
              const selectedSize = item.sizes?.[0]?.value || 'standard';
              const cartItem = cartItems.find(
                (cartEntry) => cartEntry.id === item.id && cartEntry.selectedSize === selectedSize
              );

              return (
              <div key={item.id} className={styles.wishlistCard}>
                <button 
                  className={styles.removeBtn}
                  onClick={() => {
                    removeFromWishlist(item.id);
                    showToast('Item removed from wishlist', 'info');
                  }}
                  aria-label="Remove from wishlist"
                >
                  <Trash2 size={18} />
                </button>
                
                <Link href={`/product/${item.slug}`} className={styles.imageWrap}>
                  <div 
                    className={styles.productImage} 
                    style={{ backgroundImage: `url(${item.image})` }}
                  />
                  <div className={styles.categoryTag}>
                    {item.category.replace('-', ' ')}
                  </div>
                </Link>
                
                <div className={styles.productInfo}>
                  <Link href={`/product/${item.slug}`} className={styles.productName}>
                    {item.name}
                  </Link>
                  
                  <div className={styles.ratingBox}>
                    <span className={styles.star}>★</span>
                    <span className={styles.rating}>{item.rating}</span>
                    <span className={styles.reviews}>({item.reviewCount})</span>
                  </div>
                  
                  <div className={styles.priceBox}>
                    <span className={styles.bulkPrice}>₹{item.bulkPrice.toFixed(2)}</span>
                    <span className={styles.unit}>/pc onwards</span>
                  </div>
                  
                  {cartItem ? (
                    <div className={styles.quantityControl}>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item, cartItem.quantity - 1)}
                        aria-label={'Decrease ' + item.name + ' quantity'}
                      >
                        <Minus size={18} />
                      </button>
                      <span>{cartItem.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item, cartItem.quantity + 1)}
                        aria-label={'Increase ' + item.name + ' quantity'}
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      className={`btn btn-primary ${styles.addToCartBtn}`}
                      onClick={() => handleAddToCart(item)}
                    >
                      <ShoppingCart size={18} /> Add to Cart
                    </button>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
