import { api } from '../lib/api';
import type { WishlistItem } from '../types';

export async function fetchWishlist(): Promise<WishlistItem[]> {
  return api.get<WishlistItem[]>('/api/wishlist');
}

export async function addWishlistItem(productId: string): Promise<WishlistItem> {
  return api.post<WishlistItem>('/api/wishlist', { product_id: productId });
}

export async function removeWishlistItem(itemId: string): Promise<void> {
  await api.delete(`/api/wishlist/${itemId}`);
}
