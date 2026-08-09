import { api } from '../lib/api';
import type { CartItem } from '../types';

export async function fetchCart(): Promise<CartItem[]> {
  return api.get<CartItem[]>('/api/cart');
}

export async function addCartItem(productId: string, quantity = 1): Promise<CartItem> {
  return api.post<CartItem>('/api/cart/items', { product_id: productId, quantity });
}

export async function updateCartItem(itemId: string, quantity: number): Promise<CartItem> {
  return api.put<CartItem>(`/api/cart/items/${itemId}`, { quantity });
}

export async function deleteCartItem(itemId: string): Promise<void> {
  await api.delete(`/api/cart/items/${itemId}`);
}

export async function clearCart(): Promise<void> {
  await api.delete('/api/cart');
}

export async function mergeCart(localItems: Array<{ product_id: string; quantity: number }>): Promise<CartItem[]> {
  const serverItems = await fetchCart();
  const serverMap = new Map(serverItems.map(item => [item.product_id, item]));

  for (const localItem of localItems) {
    const existing = serverMap.get(localItem.product_id);
    if (existing) {
      await updateCartItem(existing.id, existing.quantity + localItem.quantity);
    } else {
      await addCartItem(localItem.product_id, localItem.quantity);
    }
  }

  return fetchCart();
}
