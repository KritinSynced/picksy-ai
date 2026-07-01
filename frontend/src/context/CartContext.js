import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user, refreshUser } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Helper to structure cart items from database format to frontend product format
  const formatDbCart = (dbCart) => {
    if (!dbCart) return [];
    return dbCart.map(item => {
      if (!item.productId) return null;
      return {
        ...item.productId,
        quantity: item.quantity,
        dbItemId: item._id
      };
    }).filter(item => item !== null);
  };

  // Sync cart state with database when user logs in, or localStorage for guest
  useEffect(() => {
    const syncCart = async () => {
      setLoading(true);
      if (user && user._id !== 'guest') {
        try {
          // Merge guest cart with db cart if guest cart has items
          const savedGuestCart = localStorage.getItem('guest_cart');
          let currentDbCart = formatDbCart(user.cart);
          
          if (savedGuestCart) {
            try {
              const guestItems = JSON.parse(savedGuestCart);
              if (guestItems.length > 0) {
                console.log('Merging guest cart with database cart...');
                for (const item of guestItems) {
                  // Add each guest item to backend cart
                  await axios.post(`${API_URL}/users/${user._id}/cart`, {
                    productId: item._id,
                    quantity: item.quantity || 1
                  });
                }
                // Refetch user profile to get fully merged and populated cart
                await refreshUser();
              }
            } catch (err) {
              console.error('Failed to merge guest cart:', err);
            } finally {
              localStorage.removeItem('guest_cart');
            }
          } else {
            setCartItems(currentDbCart);
          }
        } catch (err) {
          console.error('Failed to sync user cart:', err);
        }
      } else {
        // Load guest cart from localStorage
        const savedCart = localStorage.getItem('guest_cart');
        if (savedCart) {
          try {
            setCartItems(JSON.parse(savedCart));
          } catch (error) {
            console.error('Failed to parse guest cart:', error);
            localStorage.removeItem('guest_cart');
          }
        } else {
          setCartItems([]);
        }
      }
      setLoading(false);
    };

    syncCart();
  }, [user]);

  // Update localStorage and totals whenever cart items state changes
  useEffect(() => {
    if (!user || user._id === 'guest') {
      localStorage.setItem('guest_cart', JSON.stringify(cartItems));
    }
    
    // Calculate total count
    const count = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
    setCartCount(count);
    
    // Calculate total price
    const total = cartItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
    setCartTotal(total);
  }, [cartItems, user]);

  const addToCart = async (product, quantity = 1) => {
    if (!product || !product._id) {
      console.error('Invalid product:', product);
      return false;
    }

    if (user && user._id !== 'guest') {
      try {
        setLoading(true);
        const response = await axios.post(`${API_URL}/users/${user._id}/cart`, {
          productId: product._id,
          quantity
        });
        setCartItems(formatDbCart(response.data.cart));
        await refreshUser(); // Sync history/recommendation engine
        return true;
      } catch (err) {
        console.error('Failed to add item to database cart:', err);
        return false;
      } finally {
        setLoading(false);
      }
    } else {
      // Local cart updates for guests
      setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item._id === product._id);
        if (existingItem) {
          return prevItems.map(item =>
            item._id === product._id
              ? { ...item, quantity: (item.quantity || 1) + quantity }
              : item
          );
        } else {
          return [...prevItems, { 
            ...product, 
            quantity: quantity,
            images: product.images || ['https://via.placeholder.com/200x200?text=No+Image']
          }];
        }
      });
      return true;
    }
  };

  const removeFromCart = async (productId) => {
    if (user && user._id !== 'guest') {
      try {
        setLoading(true);
        const response = await axios.delete(`${API_URL}/users/${user._id}/cart/${productId}`);
        setCartItems(formatDbCart(response.data.cart));
        await refreshUser();
      } catch (err) {
        console.error('Failed to remove item from database cart:', err);
      } finally {
        setLoading(false);
      }
    } else {
      setCartItems(prevItems => prevItems.filter(item => item._id !== productId));
    }
  };

  const updateQuantity = async (productId, quantity) => {
    const existingItem = cartItems.find(item => item._id === productId);
    if (!existingItem) return;

    if (quantity < 1) {
      await removeFromCart(productId);
      return;
    }

    if (user && user._id !== 'guest') {
      try {
        setLoading(true);
        const diff = quantity - existingItem.quantity;
        if (diff !== 0) {
          const response = await axios.post(`${API_URL}/users/${user._id}/cart`, {
            productId,
            quantity: diff
          });
          setCartItems(formatDbCart(response.data.cart));
          await refreshUser();
        }
      } catch (err) {
        console.error('Failed to update quantity in database cart:', err);
      } finally {
        setLoading(false);
      }
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item._id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = async () => {
    if (user && user._id !== 'guest') {
      try {
        setLoading(true);
        // Delete items from database cart one by one
        for (const item of cartItems) {
          await axios.delete(`${API_URL}/users/${user._id}/cart/${item._id}`);
        }
        setCartItems([]);
        await refreshUser();
      } catch (err) {
        console.error('Failed to clear database cart:', err);
      } finally {
        setLoading(false);
      }
    } else {
      setCartItems([]);
    }
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      cartTotal,
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};