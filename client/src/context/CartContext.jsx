import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

// New wishlist state
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

  useEffect(() => {
    localStorage.setItem('wishlist_items', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const addToWishlist = async (productId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api/Wishlist/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, variantId: null })
      });
      if (!res.ok) throw new Error('Failed to add to wishlist');
      // Optimistically update UI
      setWishlistItems(prev => [...prev, { productId }]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    localStorage.setItem('cart_items', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
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
    setIsCartOpen(true);
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      addToWishlist,
      removeFromCart,
      updateQuantity,
      clearCart,
      subtotal,
      totalCount,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
