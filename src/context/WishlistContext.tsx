/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { logger } from '../lib/logger';
import { useAuth } from './AuthContext';
import type { WishlistItem, Product } from '../types';
import { fetchWishlist, addWishlistItem, removeWishlistItem } from '../services/wishlist';

interface WishlistContextType {
  items: WishlistItem[];
  productIds: string[];
  loading: boolean;
  toggleItem: (productId: string, product?: Product) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const productIds = items.map(i => i.product_id);

  const loadWishlist = useCallback(async () => {
    try {
      if (!user) {
        const stored = localStorage.getItem('be_market_wishlist');
        setItems(stored ? JSON.parse(stored) : []);
      } else {
        const wishlistData = await fetchWishlist();
        setItems(wishlistData);
      }
    } catch (err) {
      logger.error('Wishlist fetch error:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    loadWishlist();
  }, [loadWishlist]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('be_market_wishlist', JSON.stringify(items));
    }
  }, [items, user]);

  const isInWishlist = (productId: string) => productIds.includes(productId);

  const toggleItem = async (productId: string, product?: Product) => {
    if (user) {
      const existing = items.find(i => i.product_id === productId);
      if (existing) {
        await removeWishlistItem(existing.id);
        setItems(prev => prev.filter(i => i.product_id !== productId));
      } else {
        const data = await addWishlistItem(productId);
        setItems(prev => [...prev, { ...data, product } as WishlistItem]);
      }
    } else {
      if (productIds.includes(productId)) {
        setItems(prev => prev.filter(i => i.product_id !== productId));
      } else if (product) {
        setItems(prev => [...prev, {
          id: crypto.randomUUID(),
          user_id: '',
          product_id: productId,
          created_at: new Date().toISOString(),
          product
        }]);
      }
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        productIds,
        loading,
        toggleItem,
        isInWishlist
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
