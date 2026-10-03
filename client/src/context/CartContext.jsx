import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../api/client';

const CartContext = createContext();
const WishlistContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const localData = localStorage.getItem('cart_items');
      return localData ? JSON.parse(localData) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const localData = localStorage.getItem('wishlist_items');
      return localData ? JSON.parse(localData) : [];
    } catch {
      return [];
    }
  });

  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info', actionText = null, onAction = null) => {
    setToast({ message, type, actionText, onAction });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 3500);
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  useEffect(() => {
    localStorage.setItem('cart_items', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('wishlist_items', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const isInCart = useCallback((productId) => {
    return cartItems.some(item => item.id === productId);
  }, [cartItems]);

  const addToCart = useCallback(async (product, quantity = 1, openCart = false) => {
    await new Promise(res => setTimeout(res, 350));
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });

    if (openCart) {
      setIsCartOpen(true);
    }
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity: newQty } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const isInWishlist = useCallback((productId) => {
    if (!productId) return false;
    return wishlistItems.some(item => {
      const id = typeof item === 'object' ? (item.id || item.productId) : item;
      return id === productId;
    });
  }, [wishlistItems]);

  const addToWishlist = useCallback(async (product) => {
    await new Promise(res => setTimeout(res, 350));
    const productId = typeof product === 'object' ? product.id : product;
    const itemToStore = typeof product === 'object'
      ? { id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl, categoryName: product.categoryName }
      : { id: productId, productId };

    setWishlistItems(prev => {
      const exists = prev.some(item => (typeof item === 'object' ? (item.id || item.productId) : item) === productId);
      if (exists) return prev;
      return [...prev, itemToStore];
    });

    try {
      await apiFetch('/Wishlist/add', {
        method: 'POST',
        body: JSON.stringify({ productId, variantId: null })
      });
    } catch {
      // Offline / guest fallback already handled in state/localStorage
    }
  }, []);

  const removeFromWishlist = useCallback(async (productId) => {
    await new Promise(res => setTimeout(res, 250));
    setWishlistItems(prev => prev.filter(item => (typeof item === 'object' ? (item.id || item.productId) : item) !== productId));

    try {
      await apiFetch(`/Wishlist/${productId}`, {
        method: 'DELETE'
      });
    } catch {
      // Offline fallback
    }
  }, []);

  const toggleWishlist = useCallback(async (product) => {
    const productId = typeof product === 'object' ? product.id : product;
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
      return false; // Removed
    } else {
      await addToWishlist(product);
      return true; // Added
    }
  }, [isInWishlist, removeFromWishlist, addToWishlist]);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    totalCount,
    isInCart,
    isCartOpen,
    setIsCartOpen,
    wishlistItems,
    wishlistCount,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    toast,
    showToast,
    hideToast
  };

  return (
    <CartContext.Provider value={value}>
      <WishlistContext.Provider value={value}>
        {children}
      </WishlistContext.Provider>
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
export const useWishlist = () => useContext(WishlistContext) || useContext(CartContext);
