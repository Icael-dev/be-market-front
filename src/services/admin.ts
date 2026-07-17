import { api } from '../lib/api';
import type {
  Product,
  Category,
  Banner,
  BlogPost,
  Coupon,
  FlashSale,
  Order,
  Profile,
  Settings
} from '../types';

export interface AdminStats {
  total_revenue: number;
  total_orders: number;
  total_products: number;
  total_customers: number;
  period_revenue: number;
  period_orders: number;
  new_customers: number;
  avg_order: number;
  revenue_change: number;
  orders_change: number;
  daily_revenue: Array<{ date: string; revenue: number; orders: number }>;
  status_data: Array<{ name: string; value: number }>;
  payment_data: Array<{ name: string; value: number }>;
}

export interface AdminCustomer extends Profile {
  orders_count?: number;
  total_spent?: number;
}

type MaybePaginated<T> = T[] | { data: T[] };

function unwrapList<T>(response: MaybePaginated<T>): T[] {
  return Array.isArray(response) ? response : response.data;
}

export async function uploadProductImage(formData: FormData): Promise<{ url: string }> {
  return api.post<{ url: string }>('/api/admin/products/upload-image', formData);
}

// Products
export async function fetchAdminProducts(): Promise<Product[]> {
  return unwrapList(await api.get<MaybePaginated<Product>>('/api/admin/products'));
}

export async function createAdminProduct(product: Partial<Product>): Promise<Product> {
  return api.post<Product>('/api/admin/products', product);
}

export async function updateAdminProduct(id: string, product: Partial<Product>): Promise<Product> {
  return api.put<Product>(`/api/admin/products/${id}`, product);
}

export async function deleteAdminProduct(id: string): Promise<void> {
  await api.delete(`/api/admin/products/${id}`);
}

// Categories
export async function fetchAdminCategories(): Promise<Category[]> {
  try {
    return await api.get<Category[]>('/api/admin/categories');
  } catch {
    return await api.get<Category[]>('/api/categories');
  }
}

export async function createAdminCategory(category: Partial<Category>): Promise<Category> {
  return api.post<Category>('/api/admin/categories', category);
}

export async function updateAdminCategory(id: string, category: Partial<Category>): Promise<Category> {
  return api.put<Category>(`/api/admin/categories/${id}`, category);
}

export async function deleteAdminCategory(id: string): Promise<void> {
  await api.delete(`/api/admin/categories/${id}`);
}

// Banners
export async function fetchAdminBanners(): Promise<Banner[]> {
  return unwrapList(await api.get<MaybePaginated<Banner>>('/api/admin/banners'));
}

export async function createAdminBanner(banner: Partial<Banner>): Promise<Banner> {
  return api.post<Banner>('/api/admin/banners', banner);
}

export async function updateAdminBanner(id: string, banner: Partial<Banner>): Promise<Banner> {
  return api.put<Banner>(`/api/admin/banners/${id}`, banner);
}

export async function deleteAdminBanner(id: string): Promise<void> {
  await api.delete(`/api/admin/banners/${id}`);
}

// Blog Posts
export async function fetchAdminBlogPosts(): Promise<BlogPost[]> {
  return unwrapList(await api.get<MaybePaginated<BlogPost>>('/api/admin/blog-posts'));
}

export async function createAdminBlogPost(post: Partial<BlogPost>): Promise<BlogPost> {
  return api.post<BlogPost>('/api/admin/blog-posts', post);
}

export async function updateAdminBlogPost(id: string, post: Partial<BlogPost>): Promise<BlogPost> {
  return api.put<BlogPost>(`/api/admin/blog-posts/${id}`, post);
}

export async function deleteAdminBlogPost(id: string): Promise<void> {
  await api.delete(`/api/admin/blog-posts/${id}`);
}

// Coupons
export async function fetchAdminCoupons(): Promise<Coupon[]> {
  return unwrapList(await api.get<MaybePaginated<Coupon>>('/api/admin/coupons'));
}

export async function createAdminCoupon(coupon: Partial<Coupon>): Promise<Coupon> {
  return api.post<Coupon>('/api/admin/coupons', coupon);
}

export async function updateAdminCoupon(id: string, coupon: Partial<Coupon>): Promise<Coupon> {
  return api.put<Coupon>(`/api/admin/coupons/${id}`, coupon);
}

export async function deleteAdminCoupon(id: string): Promise<void> {
  await api.delete(`/api/admin/coupons/${id}`);
}

// Flash Sales
export async function fetchAdminFlashSales(): Promise<FlashSale[]> {
  return unwrapList(await api.get<MaybePaginated<FlashSale>>('/api/admin/flash-sales'));
}

export async function createAdminFlashSale(flashSale: Partial<FlashSale>): Promise<FlashSale> {
  return api.post<FlashSale>('/api/admin/flash-sales', flashSale);
}

export async function updateAdminFlashSale(id: string, flashSale: Partial<FlashSale>): Promise<FlashSale> {
  return api.put<FlashSale>(`/api/admin/flash-sales/${id}`, flashSale);
}

export async function deleteAdminFlashSale(id: string): Promise<void> {
  await api.delete(`/api/admin/flash-sales/${id}`);
}

// Settings
export async function fetchAdminSettings(): Promise<Settings> {
  return api.get<Settings>('/api/admin/settings');
}

export async function updateAdminSettings(settings: Partial<Settings>): Promise<Settings> {
  return api.put<Settings>('/api/admin/settings', settings);
}

// Orders
export async function fetchAdminOrders(): Promise<Order[]> {
  return unwrapList(await api.get<MaybePaginated<Order>>('/api/admin/orders'));
}

export async function updateAdminOrder(id: string, order: Partial<Order>): Promise<Order> {
  return api.put<Order>(`/api/admin/orders/${id}`, order);
}

// Customers
export async function fetchAdminCustomers(): Promise<AdminCustomer[]> {
  return unwrapList(await api.get<MaybePaginated<AdminCustomer>>('/api/admin/customers'));
}

// Statistics
export async function fetchAdminStatistics(days?: number): Promise<AdminStats> {
  return api.get<AdminStats>(`/api/admin/statistics${days ? `?days=${days}` : ''}`);
}

// Export
export async function fetchAdminExport(type: string): Promise<Blob> {
  const API_BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
  const token = localStorage.getItem('be_market_jwt_token');
  const headers: Record<string, string> = { Accept: 'text/csv' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/admin/export?type=${encodeURIComponent(type)}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error('Export failed');
  }

  return response.blob();
}
