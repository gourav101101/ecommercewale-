'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
// Removed mock data dependency

const WishlistContext = createContext();

function normalizeWishlistItem(item) {
  if (!item || !item.name) return null;
  return item;
}

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const saved = localStorage.getItem('ecommercewale_wishlist');
        const items = saved ? JSON.parse(saved) : [];
        if (Array.isArray(items)) {
          setWishlistItems(items.map(normalizeWishlistItem).filter(Boolean));
        }
      } catch (e) {
        console.error('Error loading wishlist:', e);
      }
      setIsLoaded(true);
    });
  }, []);

  // Persist wishlist to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('ecommercewale_wishlist', JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, isLoaded]);

  const addToWishlist = useCallback((product) => {
    setWishlistItems((prev) => {
      if (prev.find((item) => item.id === product.id)) return prev;
      return [
        ...prev,
        {
          id: product.id,
          slug: product.slug,
          name: product.name,
          image: product.image,
          basePrice: product.basePrice,
          bulkPrice: product.bulkPrice,
          pricing: product.pricing,
          rating: product.rating,
          reviewCount: product.reviewCount,
          category: product.category,
          sizes: product.sizes,
        },
      ];
    });
  }, []);

  const removeFromWishlist = useCallback((productId) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const toggleWishlist = useCallback((product) => {
    const exists = wishlistItems.find((item) => item.id === product.id);
    if (exists) {
      removeFromWishlist(product.id);
      return false; // removed
    } else {
      addToWishlist(product);
      return true; // added
    }
  }, [wishlistItems, addToWishlist, removeFromWishlist]);

  const isInWishlist = useCallback(
    (productId) => wishlistItems.some((item) => item.id === productId),
    [wishlistItems]
  );

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        isLoaded,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
