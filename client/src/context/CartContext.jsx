import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('kisanconnect_cart');
    if (saved) {
      try {
        setCartItems(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('kisanconnect_cart');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('kisanconnect_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (listing, orderQty = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.listing._id === listing._id);
      if (existing) {
        return prev.map((item) =>
          item.listing._id === listing._id
            ? { ...item, quantity: Math.min(listing.quantity, item.quantity + Number(orderQty)) }
            : item
        );
      }
      return [...prev, { listing, quantity: Number(orderQty) }];
    });
  };

  const updateQuantity = (listingId, quantity) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.listing._id === listingId) {
            const validQty = Math.max(1, Math.min(item.listing.quantity, Number(quantity)));
            return { ...item, quantity: validQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (listingId) => {
    setCartItems((prev) => prev.filter((item) => item.listing._id !== listingId));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('kisanconnect_cart');
  };

  const cartTotalAmount = cartItems.reduce(
    (total, item) => total + item.quantity * item.listing.pricePerUnit,
    0
  );

  const totalItemsCount = cartItems.reduce((sum, item) => sum + 1, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartTotalAmount,
        totalItemsCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
