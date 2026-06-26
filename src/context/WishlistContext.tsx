import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { WishlistItem, Product } from '../types';

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

  const fetchWishlist = useCallback(async () => {
    try {
      if (!user) {
        const stored = localStorage.getItem('electronica_wishlist');
        setItems(stored ? JSON.parse(stored) : []);
        setLoading(false);
        return;
      }

      const { data: wishlistData } = await supabase
        .from('wishlist')
        .select('*')
        .eq('user_id', user.id);

      if (wishlistData && wishlistData.length > 0) {
        const productIds = wishlistData.map((i: any) => i.product_id);
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds);

        const merged = wishlistData.map((item: any) => ({
          ...item,
          product: productsData?.find((p: any) => p.id === item.product_id)
        }));
        setItems(merged as WishlistItem[]);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error('Wishlist fetch error:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('electronica_wishlist', JSON.stringify(items));
    }
  }, [items, user]);

  const isInWishlist = (productId: string) => productIds.includes(productId);

  const toggleItem = async (productId: string, product?: Product) => {
    if (user) {
      const existing = items.find(i => i.product_id === productId);
      if (existing) {
        await supabase.from('wishlist').delete().eq('id', existing.id);
        setItems(prev => prev.filter(i => i.product_id !== productId));
      } else {
        const { data, error } = await supabase
          .from('wishlist')
          .insert({ user_id: user.id, product_id: productId })
          .select('*')
          .single();

        if (!error && data) {
          setItems(prev => [...prev, { ...data, product } as WishlistItem]);
        }
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
