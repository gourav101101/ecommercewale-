'use client';

import Link from 'next/link';
import { ShoppingCart, Star, Heart, Minus, Plus, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }) {
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const isOutOfStock = product.inStock === false;
  
  const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0].value : null;
  const cartItem = cartItems.find(
    (item) => item.id === product.id && item.selectedSize === defaultSize
  );
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (isOutOfStock) {
      showToast('This product is currently out of stock', 'error');
      return;
    }
    if (defaultSize) {
      addToCart(product, defaultSize, 1);
      showToast(`${product.name} added to cart`, 'success');
    }
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    const added = toggleWishlist(product);
    showToast(added ? 'Added to wishlist' : 'Removed from wishlist', added ? 'success' : 'info');
  };

  const handleQuantityChange = (e, quantity) => {
    e.preventDefault();
    e.stopPropagation();

    if (!cartItem) return;
    if (quantity < 1) {
      removeFromCart(product.id, defaultSize);
      showToast(`${product.name} removed from cart`, 'info');
    } else {
      updateQuantity(product.id, defaultSize, quantity);
    }
  };

  return (
    <Link href={`/product/${product.slug}`} className={`${styles.card} ${isOutOfStock ? styles.outOfStock : ''}`}>
      <div className={styles.imageWrap}>
        <div 
          className={styles.image} 
          style={{ backgroundImage: `url(${product.image})` }} 
          aria-label={product.name}
        />
        {isOutOfStock && (
          <span className={styles.outOfStockBadge}>Out of Stock</span>
        )}
        {product.bestSeller && !isOutOfStock && (
          <span className={styles.badge}>Best Seller</span>
        )}
        
        <button 
          className={`${styles.wishlistBtn} ${isWishlisted ? styles.wishlisted : ''}`}
          onClick={handleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
        </button>
      </div>
      
      <div className={styles.content}>
        <div className={styles.category}>{product.type}</div>
        <h3 className={styles.title}>{product.name}</h3>
        
        <div className={styles.rating}>
          <Star size={14} className={styles.starIcon} fill="currentColor" />
          <span>{product.rating}</span>
          <span className={styles.reviewCount}>({product.reviewCount})</span>
        </div>
        
        <div className={styles.priceRow}>
          <div className={styles.priceInfo}>
            <span className={styles.priceLabel}>From</span>
            <span className={styles.priceValue}>₹{product.bulkPrice ? Number(product.bulkPrice).toFixed(2) : '0.00'}</span>
            <span className={styles.priceUnit}>/pc</span>
          </div>
        </div>
        
        <div className={styles.marketplaces}>
          {product.marketplaceCompatible && product.marketplaceCompatible.map(mp => (
            <span key={mp} className={`${styles.mpDot} ${styles[mp]}`} title={mp} />
          ))}
        </div>

        {/* Cart Controls — Always visible */}
        <div className={styles.cartActions} onClick={(e) => e.preventDefault()}>
          {cartItem ? (
            <div className={styles.quantityStepper}>
              <button
                type="button"
                className={styles.stepperBtn}
                onClick={(e) => handleQuantityChange(e, cartItem.quantity - 1)}
                aria-label={"Decrease " + product.name + " quantity"}
              >
                <Minus size={16} />
              </button>
              <span className={styles.stepperValue} aria-label={"Quantity: " + cartItem.quantity}>
                {cartItem.quantity}
              </span>
              <button
                type="button"
                className={styles.stepperBtn}
                onClick={(e) => handleQuantityChange(e, cartItem.quantity + 1)}
                aria-label={"Increase " + product.name + " quantity"}
              >
                <Plus size={16} />
              </button>
              <span className={styles.inCartBadge}>
                <Check size={12} /> In Cart
              </span>
            </div>
          ) : (
            <button 
              className={`${styles.addToCartBtn} ${isOutOfStock ? styles.addToCartDisabled : ''}`}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              aria-label={isOutOfStock ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
            >
              <ShoppingCart size={16} />
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
