'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storefrontImage } from '@/lib/product-visuals';
import { excludedFromStorefront, archiveExcludedSelections } from '@/lib/storefront-policy';
// Removed mock data dependency

const WishlistContext = createContext();

function normalizeWishlistItem(item) {
  if (!item || !item.name || excludedFromStorefront(item)) return null;
  return {...item, image:storefrontImage(item)};
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
          archiveExcludedSelections(items,'wishlist');
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
      try { localStorage.setItem('ecommercewale_wishlist', JSON.stringify(wishlistItems)); } catch { /* Storage may be disabled. */ }
    }
  }, [wishlistItems, isLoaded]);

  const addToWishlist = useCallback((product) => {
    if(excludedFromStorefront(product)) return;
    setWishlistItems((prev) => {
      if (prev.find((item) => item.id === product.id)) return prev;
      return [
        ...prev,
        {
          id: product.id,
          slug: product.slug,
          name: product.name,
          image: product.image,
          sourceImageId: product.sourceImageId,
          sourceImageUrl: product.sourceImageUrl,
          imageStatus: product.imageStatus,
          basePrice: product.basePrice,
          bulkPrice: product.bulkPrice,
          pricing: product.pricing,
          rating: product.rating,
          reviewCount: product.reviewCount,
          category: product.category,
          sizes: product.sizes,
          inStock: product.inStock,
          type: product.type,
          pricingMode: product.pricingMode,
          variantCount: product.variantCount,
          marketplaceCompatible: product.marketplaceCompatible,
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
