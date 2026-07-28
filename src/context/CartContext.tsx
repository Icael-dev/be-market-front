import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { logger } from '../lib/logger';
import { useAuth } from './AuthContext';
import type { Product, CartItem } from '../types';
import { fetchCart, addCartItem, updateCartItem, deleteCartItem, clearCart as clearCartService } from '../services/cart';

interface CartContextType {
  items: CartItem[];
  count: number;
  total: number;
  loading: boolean;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const count = items.reduce((acc, item) => acc + item.quantity, 0);
  const total = items.reduce((acc, item) => {
    const price = item.product?.effective_price ?? item.product?.price ?? 0;
    return acc + price * item.quantity;
  }, 0);

  const loadCart = useCallback(async () => {
    try {
      if (user) {
        const cartItems = await fetchCart();
        setItems(cartItems);
      } else {
        const stored = localStorage.getItem('be_market_cart_items');
        setItems(stored ? JSON.parse(stored) : []);
      }
    } catch (error) {
      logger.error('Error fetching cart:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    loadCart();
  }, [loadCart]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('be_market_cart_items', JSON.stringify(items));
    }
  }, [items, user]);

  const addItem = async (product: Product, quantity = 1) => {
    if (user) {
      const existing = items.find(i => i.product_id === product.id);
      if (existing) {
        await updateQuantity(product.id, existing.quantity + quantity);
        return;
      }

      try {
        const newItem = await addCartItem(product.id, quantity);
        setItems(prev => [...prev, { ...newItem, product } as CartItem]);
      } catch (error) {
        logger.error('Error adding cart item:', error);
      }
    } else {
      setItems(prev => {
        const existing = prev.find(i => i.product_id === product.id);
        if (existing) {
          return prev.map(i =>
            i.product_id === product.id ? { ...i, quantity: i.quantity + quantity } : i
          );
        }
        return [
          ...prev,
          {
            id: crypto.randomUUID(),
            cart_id: '',
            product_id: product.id,
            quantity,
            product
          }
        ];
      });
    }
  };

  const removeItem = async (productId: string) => {
    if (user) {
      const item = items.find(i => i.product_id === productId);
      if (item) {
        await deleteCartItem(item.id);
      }
    }
    setItems(prev => prev.filter(i => i.product_id !== productId));
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) {
      await removeItem(productId);
      return;
    }

    if (user) {
      const item = items.find(i => i.product_id === productId);
      if (item) {
        try {
          await updateCartItem(item.id, quantity);
        } catch (error) {
          logger.error('Error updating cart item:', error);
        }
      }
    }

    setItems(prev =>
      prev.map(i => (i.product_id === productId ? { ...i, quantity } : i))
    );
  };

  const clearCart = async () => {
    if (user) {
      try {
        await clearCartService();
      } catch (error) {
        logger.error('Error clearing cart:', error);
      }
    }
    setItems([]);
    localStorage.removeItem('be_market_cart_items');
  };

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        total,
        loading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart
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
