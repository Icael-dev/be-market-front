import { api } from '../lib/api';
import type {
  Faq,
  LegalPage,
  Banner,
  FlashSale,
  Review,
  LoyaltyPoints,
  LoyaltyTransaction
} from '../types';

export async function fetchFaqs(): Promise<Faq[]> {
  return api.get<Faq[]>('/api/faqs');
}

export async function fetchLegalPages(): Promise<LegalPage[]> {
  return api.get<LegalPage[]>('/api/legal');
}

export async function fetchBanners(): Promise<Banner[]> {
  return api.get<Banner[]>('/api/banners');
}

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  return api.get<BlogPost[]>('/api/blog-posts?published=true');
}

export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost> {
  return api.get<BlogPost>(`/api/blog-posts/${encodeURIComponent(slug)}`);
}

export async function fetchFlashSales(): Promise<FlashSale[]> {
  return api.get<FlashSale[]>('/api/flash-sales?active=true');
}

export async function fetchReviews(productId: string): Promise<Review[]> {
  return api.get<Review[]>(`/api/reviews?product_id=${encodeURIComponent(productId)}`);
}

export async function submitReview(productId: string, payload: { rating: number; title?: string; comment?: string }): Promise<Review> {
  return api.post<Review>('/api/reviews', { product_id: productId, ...payload });
}

export async function fetchLoyaltyPoints(): Promise<LoyaltyPoints> {
  return api.get<LoyaltyPoints>('/api/loyalty/points');
}

export async function fetchLoyaltyTransactions(): Promise<LoyaltyTransaction[]> {
  return api.get<LoyaltyTransaction[]>('/api/loyalty/transactions');
}

export async function subscribeNewsletter(email: string): Promise<void> {
  await api.post('/api/newsletter', { email });
}

export async function createStockNotification(productId: string, email: string): Promise<void> {
  await api.post('/api/stock-notifications', { product_id: productId, email });
}
