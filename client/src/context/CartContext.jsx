import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as cartApi from '../api/cartApi';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] });
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart({ items: [] });
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      const { data } = await cartApi.getCart();
      setCart(data.data);
    } catch {
      // Ignore cart fetch errors
    }
  };

  const addItem = useCallback(async (productId, quantity = 1) => {
    try {
      const { data } = await cartApi.addToCart(productId, quantity);
      setCart(data.data);
      toast.success('Added to bag!');
      setIsOpen(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add item');
    }
  }, []);

  const updateItem = useCallback(async (productId, quantity) => {
    try {
      const { data } = await cartApi.updateCartItem(productId, quantity);
      setCart(data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update item');
    }
  }, []);

  const removeItem = useCallback(async (productId) => {
    try {
      const { data } = await cartApi.removeFromCart(productId);
      setCart(data.data);
      toast.success('Removed from bag');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove item');
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      await cartApi.clearCart();
      setCart({ items: [] });
    } catch (error) {
      toast.error('Failed to clear cart');
    }
  }, []);

  const itemCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const subtotal = cart.items?.reduce((sum, item) => {
    const price = item.product?.price || item.priceAtAdd || 0;
    return sum + price * item.quantity;
  }, 0) || 0;

  const value = {
    cart,
    isOpen,
    setIsOpen,
    addItem,
    updateItem,
    removeItem,
    clearAll,
    fetchCart,
    itemCount,
    subtotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
