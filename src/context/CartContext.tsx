import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { Product, CartItem } from '../types';

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
  const [cartId, setCartId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const count = items.reduce((acc, item) => acc + item.quantity, 0);
  const total = items.reduce((acc, item) => {
    const price = item.product?.price ?? 0;
    return acc + price * item.quantity;
  }, 0);

  const fetchCart = useCallback(async () => {
    try {
      if (user) {
        const { data: existingCart } = await supabase
          .from('carts')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        let cart = existingCart;

        if (!cart) {
          const { data: newCart } = await supabase
            .from('carts')
            .insert({ user_id: user.id })
            .select()
            .single();
          cart = newCart;
        }

        if (cart) {
          setCartId(cart.id);
          const { data: cartItemsData } = await supabase
            .from('cart_items')
            .select('*')
            .eq('cart_id', cart.id);

          if (cartItemsData && cartItemsData.length > 0) {
            const productIds = cartItemsData.map((i: any) => i.product_id);
            const { data: productsData } = await supabase
              .from('products')
              .select('*')
              .in('id', productIds);

            const merged = cartItemsData.map((item: any) => ({
              ...item,
              product: productsData?.find((p: any) => p.id === item.product_id)
            }));
            setItems(merged as CartItem[]);
          } else {
            setItems([]);
          }
        }
      } else {
        const stored = localStorage.getItem('electronica_cart_items');
        if (stored) {
          setItems(JSON.parse(stored));
        }
        setCartId(null);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('electronica_cart_items', JSON.stringify(items));
    }
  }, [items, user]);

  const addItem = async (product: Product, quantity = 1) => {
    if (cartId && user) {
      const existing = items.find(i => i.product_id === product.id);
      if (existing) {
        await updateQuantity(product.id, existing.quantity + quantity);
      } else {
        const { data, error } = await supabase
          .from('cart_items')
          .insert({ cart_id: cartId, product_id: product.id, quantity })
          .select('*')
          .single();

        if (!error && data) {
          setItems(prev => [...prev, { ...data, product } as CartItem]);
        }
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
    if (cartId && user) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cartId)
        .eq('product_id', productId);
    }
    setItems(prev => prev.filter(i => i.product_id !== productId));
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) {
      await removeItem(productId);
      return;
    }

    if (cartId && user) {
      await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('cart_id', cartId)
        .eq('product_id', productId);
    }

    setItems(prev =>
      prev.map(i => (i.product_id === productId ? { ...i, quantity } : i))
    );
  };

  const clearCart = async () => {
    if (cartId && user) {
      await supabase.from('cart_items').delete().eq('cart_id', cartId);
    }
    setItems([]);
    localStorage.removeItem('electronica_cart_items');
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
