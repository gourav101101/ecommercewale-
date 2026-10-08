'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
const CartContext = createContext();

function calculateCurrentPrice(pricing, quantity) {
  if (!pricing || pricing.length === 0) return 0;
  const sorted = [...pricing].sort((a, b) => b.minQty - a.minQty);
  for (let i = 0; i < sorted.length; i++) {
    if (quantity >= sorted[i].minQty) {
      return sorted[i].pricePerUnit;
    }
  }
  return sorted[sorted.length - 1].pricePerUnit;
}

function normalizeCartItem(item) {
  if (!item || !item.pricing) return null;

  const quantity = Number.isFinite(Number(item.quantity)) && Number(item.quantity) > 0
    ? Math.floor(Number(item.quantity))
    : 1;

  return {
    ...item,
    quantity,
    pricePerUnit: calculateCurrentPrice(item.pricing, quantity),
  };
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const saved = localStorage.getItem('ecommercewale_cart');
        const items = saved ? JSON.parse(saved) : [];
        if (Array.isArray(items)) {
          setCartItems(items.map(normalizeCartItem).filter(Boolean));
        }
      } catch (e) {
        console.error('Error loading cart:', e);
      }
      setIsLoaded(true);
    });
  }, []);

  // Persist cart to localStorage
  useEffect(() => {
    if (isLoaded) {
      try { localStorage.setItem('ecommercewale_cart', JSON.stringify(cartItems)); } catch { /* Keep the cart usable if storage is unavailable. */ }
    }
  }, [cartItems, isLoaded]);

  const addToCart = useCallback((product, selectedSize, quantity = 1) => {
    if (!product || !Array.isArray(product.pricing) || !product.pricing.length || product.inStock === false) return;
    quantity = Math.max(1, Math.floor(Number(quantity) || 1));

    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.id === product.id && item.selectedSize === selectedSize
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          pricePerUnit: calculateCurrentPrice(updated[existingIndex].pricing, newQty),
        };
        return updated;
      }

      const pricePerUnit = calculateCurrentPrice(product.pricing, quantity);
      return [
        ...prev,
        {
          id: product.id,
          slug: product.slug,
          name: product.name,
          image: product.image,
          selectedSize,
          sizeLabel: product.sizes?.find((s) => s.value === selectedSize)?.label || selectedSize,
          quantity,
          pricing: product.pricing,
          pricePerUnit,
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((id, selectedSize) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.id === id && item.selectedSize === selectedSize))
    );
  }, []);

  const updateQuantity = useCallback((id, selectedSize, newQuantity) => {
    newQuantity = Math.floor(Number(newQuantity));
    if (!Number.isFinite(newQuantity)) return;
    if (newQuantity < 1) return;
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id && item.selectedSize === selectedSize) {
          const pricePerUnit = calculateCurrentPrice(item.pricing, newQuantity);
          return { ...item, quantity: newQuantity, pricePerUnit };
        }
        return item;
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const cartCount = cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (Number(item.pricePerUnit) || 0) * (Number(item.quantity) || 0),
    0
  );

  const gstAmount = subtotal * 0.18;
  const shippingCost = subtotal > 2000 ? 0 : 99;
  const totalAmount = subtotal + gstAmount + shippingCost;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        subtotal,
        gstAmount,
        shippingCost,
        totalAmount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isLoaded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
