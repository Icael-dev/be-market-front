import { api, API_BASE_URL } from '../lib/api';
import type {
  Product,
  Category,
  Banner,
  BlogPost,
  Coupon,
  FlashSale,
  Order,
  Settings,
  StaffUser,
  UserRole,
  LoyaltyPoints,
  LoyaltyTransaction,
  Payment,
  SupportTicket,
  SupportMessage,
  AdminCustomer,
  FAQ,
  LegalPage,
  Testimonial,
  PaginatedResponse
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

export async function fetchAdminProduct(id: string): Promise<Product> {
  return api.get<Product>(`/api/admin/products/${id}`);
}

export async function fetchAdminProductOrders(id: string): Promise<Order[]> {
  return unwrapList(await api.get<MaybePaginated<Order>>(`/api/admin/products/${id}/orders`));
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

export async function restoreAdminProduct(id: string): Promise<Product> {
  return api.post<Product>(`/api/admin/products/${id}/restore`);
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

export async function restoreAdminCategory(id: string): Promise<Category> {
  return api.post<Category>(`/api/admin/categories/${id}/restore`);
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
export async function fetchAdminOrders(params?: { page?: number; per_page?: number; status?: string }): Promise<PaginatedResponse<Order>> {
  const search = new URLSearchParams();
  if (params?.status) search.set('status', params.status);
  if (params?.page) search.set('page', String(params.page));
  if (params?.per_page) search.set('per_page', String(params.per_page));
  const qs = search.toString();
  return api.get<PaginatedResponse<Order>>(`/api/admin/orders${qs ? `?${qs}` : ''}`);
}

export async function updateAdminOrder(id: string, order: Partial<Order>): Promise<Order> {
  return api.put<Order>(`/api/admin/orders/${id}`, order);
}

export async function restoreAdminOrder(id: string): Promise<Order> {
  return api.post<Order>(`/api/admin/orders/${id}/restore`);
}

// Customers
export async function fetchAdminCustomers(params?: { page?: number; per_page?: number; email?: string; search?: string }): Promise<PaginatedResponse<AdminCustomer>> {
  const search = new URLSearchParams();
  if (params?.email) search.set('email', params.email);
  if (params?.search) search.set('search', params.search);
  if (params?.page) search.set('page', String(params.page));
  if (params?.per_page) search.set('per_page', String(params.per_page));
  const qs = search.toString();
  return api.get<PaginatedResponse<AdminCustomer>>(`/api/admin/customers${qs ? `?${qs}` : ''}`);
}

// Customers (history per customer)
export async function fetchAdminCustomer(id: string): Promise<AdminCustomer> {
  return api.get<AdminCustomer>(`/api/admin/customers/${id}`);
}

export async function fetchAdminCustomerOrders(id: string): Promise<Order[]> {
  return unwrapList(await api.get<MaybePaginated<Order>>(`/api/admin/customers/${id}/orders`));
}

export async function fetchAdminCustomerLoyalty(id: string): Promise<{
  points: LoyaltyPoints | null;
  transactions: LoyaltyTransaction[];
}> {
  return api.get(`/api/admin/customers/${id}/loyalty`);
}

export async function fetchAdminCustomerPayments(id: string): Promise<Payment[]> {
  return api.get<Payment[]>(`/api/admin/customers/${id}/payments`);
}

// Payments (global admin)
export async function fetchAdminPayments(params?: { page?: number; per_page?: number; status?: string; payment_method?: string; user_id?: string }): Promise<PaginatedResponse<Payment>> {
  const search = new URLSearchParams();
  if (params?.status) search.set('status', params.status);
  if (params?.payment_method) search.set('payment_method', params.payment_method);
  if (params?.user_id) search.set('user_id', params.user_id);
  if (params?.page) search.set('page', String(params.page));
  if (params?.per_page) search.set('per_page', String(params.per_page));
  const qs = search.toString();
  return api.get<PaginatedResponse<Payment>>(`/api/admin/payments${qs ? `?${qs}` : ''}`);
}

// Loyalty (global admin)
export async function fetchAdminLoyaltyTransactions(params?: { page?: number; per_page?: number; user_id?: string; type?: string }): Promise<PaginatedResponse<LoyaltyTransaction>> {
  const search = new URLSearchParams();
  if (params?.user_id) search.set('user_id', params.user_id);
  if (params?.type) search.set('type', params.type);
  if (params?.page) search.set('page', String(params.page));
  if (params?.per_page) search.set('per_page', String(params.per_page));
  const qs = search.toString();
  return api.get<PaginatedResponse<LoyaltyTransaction>>(`/api/admin/loyalty/transactions${qs ? `?${qs}` : ''}`);
}

export async function fetchAdminLoyaltyPoints(params?: { page?: number; per_page?: number }): Promise<PaginatedResponse<LoyaltyPoints>> {
  const search = new URLSearchParams();
  if (params?.page) search.set('page', String(params.page));
  if (params?.per_page) search.set('per_page', String(params.per_page));
  const qs = search.toString();
  return api.get<PaginatedResponse<LoyaltyPoints>>(`/api/admin/loyalty/points${qs ? `?${qs}` : ''}`);
}

// Support
export async function fetchAdminSupportTickets(params?: { page?: number; per_page?: number; status?: string; priority?: string; search?: string }): Promise<PaginatedResponse<SupportTicket>> {
  const search = new URLSearchParams();
  if (params?.status) search.set('status', params.status);
  if (params?.priority) search.set('priority', params.priority);
  if (params?.search) search.set('search', params.search);
  if (params?.page) search.set('page', String(params.page));
  if (params?.per_page) search.set('per_page', String(params.per_page));
  const qs = search.toString();
  return api.get<PaginatedResponse<SupportTicket>>(`/api/admin/support/tickets${qs ? `?${qs}` : ''}`);
}

export async function fetchAdminSupportTicket(id: string): Promise<SupportTicket> {
  return api.get<SupportTicket>(`/api/admin/support/tickets/${id}`);
}

export async function updateAdminSupportTicket(id: string, data: { status?: string; priority?: string }): Promise<SupportTicket> {
  return api.put<SupportTicket>(`/api/admin/support/tickets/${id}`, data);
}

export async function sendAdminSupportMessage(ticketId: string, message: string): Promise<SupportMessage> {
  return api.post<SupportMessage>(`/api/admin/support/tickets/${ticketId}/messages`, { message });
}

// Staff / Users (super-admin only)
export interface StaffUserInput {
  full_name: string;
  email: string;
  password?: string;
  phone?: string | null;
  role: UserRole;
}

export async function fetchAdminUsers(): Promise<StaffUser[]> {
  return unwrapList(await api.get<MaybePaginated<StaffUser>>('/api/admin/users'));
}

export async function createAdminUser(user: StaffUserInput): Promise<StaffUser> {
  return api.post<StaffUser>('/api/admin/users', user);
}

export async function updateAdminUser(id: string, user: Partial<StaffUserInput>): Promise<StaffUser> {
  return api.put<StaffUser>(`/api/admin/users/${id}`, user);
}

export async function deleteAdminUser(id: string): Promise<void> {
  await api.delete(`/api/admin/users/${id}`);
}

export async function restoreAdminUser(id: string): Promise<StaffUser> {
  return api.post<StaffUser>(`/api/admin/users/${id}/restore`);
}

// Statistics
export async function fetchAdminStatistics(days?: number): Promise<AdminStats> {
  return api.get<AdminStats>(`/api/admin/statistics${days ? `?days=${days}` : ''}`);
}

export interface TopProduct {
  product_id: string;
  product_name: string;
  total_quantity: number;
  total_revenue: number;
}

export interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  stock: number;
  price: number;
}

export interface CouponStat {
  code: string;
  discount_type: string;
  discount_value: number;
  usage_count: number;
}

export interface CouponStatsResponse {
  coupons_used: CouponStat[];
  total_coupon_usages: number;
}

export interface CategorySale {
  category_id: string;
  category_name: string;
  orders_count: number;
  total_quantity: number;
  total_revenue: number;
}

export async function fetchAdminTopProducts(days?: number): Promise<TopProduct[]> {
  return api.get<TopProduct[]>(`/api/admin/statistics/top-products${days ? `?days=${days}` : ''}`);
}

export async function fetchAdminLowStock(threshold?: number): Promise<LowStockProduct[]> {
  return api.get<LowStockProduct[]>(`/api/admin/statistics/low-stock${threshold ? `?threshold=${threshold}` : ''}`);
}

export async function fetchAdminCouponStats(days?: number): Promise<CouponStatsResponse> {
  return api.get<CouponStatsResponse>(`/api/admin/statistics/coupons${days ? `?days=${days}` : ''}`);
}

export async function fetchAdminCategorySales(days?: number): Promise<CategorySale[]> {
  return api.get<CategorySale[]>(`/api/admin/statistics/category-sales${days ? `?days=${days}` : ''}`);
}

export async function fetchAdminNewCustomers(limit: number = 5): Promise<Array<{ id: string; full_name: string; email: string; created_at: string }>> {
  return api.get<Array<{ id: string; full_name: string; email: string; created_at: string }>>(`/api/admin/statistics/new-customers?limit=${limit}`);
}

export async function fetchAdminTopCustomers(limit: number = 5): Promise<Array<{ user_id: string; name: string; email: string; total_spent: number; orders_count: number }>> {
  return api.get<Array<{ user_id: string; name: string; email: string; total_spent: number; orders_count: number }>>(`/api/admin/statistics/top-customers?limit=${limit}`);
}

export async function fetchAdminUnsoldProducts(limit: number = 10): Promise<Array<{ id: string; name: string; stock: number; price: number }>> {
  return api.get<Array<{ id: string; name: string; stock: number; price: number }>>(`/api/admin/statistics/unsold-products?limit=${limit}`);
}

export async function fetchAdminFailedPayments(limit: number = 5): Promise<Array<{ id: string; order_number: string; status: string; payment_method: string; total: number }>> {
  return api.get<Array<{ id: string; order_number: string; status: string; payment_method: string; total: number }>>(`/api/admin/statistics/failed-payments?limit=${limit}`);
}

// FAQs
export async function fetchAdminFAQs(): Promise<FAQ[]> {
  return unwrapList(await api.get<MaybePaginated<FAQ>>('/api/admin/faqs'));
}

export async function createAdminFAQ(faq: Partial<FAQ>): Promise<FAQ> {
  return api.post<FAQ>('/api/admin/faqs', faq);
}

export async function updateAdminFAQ(id: string, faq: Partial<FAQ>): Promise<FAQ> {
  return api.put<FAQ>(`/api/admin/faqs/${id}`, faq);
}

export async function deleteAdminFAQ(id: string): Promise<void> {
  await api.delete(`/api/admin/faqs/${id}`);
}

// Legal Pages
export async function fetchAdminLegalPages(): Promise<LegalPage[]> {
  return unwrapList(await api.get<MaybePaginated<LegalPage>>('/api/admin/legal-pages'));
}

export async function createAdminLegalPage(page: Partial<LegalPage>): Promise<LegalPage> {
  return api.post<LegalPage>('/api/admin/legal-pages', page);
}

export async function updateAdminLegalPage(id: string, page: Partial<LegalPage>): Promise<LegalPage> {
  return api.put<LegalPage>(`/api/admin/legal-pages/${id}`, page);
}

export async function deleteAdminLegalPage(id: string): Promise<void> {
  await api.delete(`/api/admin/legal-pages/${id}`);
}

// Testimonials
export async function fetchAdminTestimonials(): Promise<Testimonial[]> {
  return unwrapList(await api.get<MaybePaginated<Testimonial>>('/api/admin/testimonials'));
}

export async function createAdminTestimonial(testimonial: Partial<Testimonial>): Promise<Testimonial> {
  return api.post<Testimonial>('/api/admin/testimonials', testimonial);
}

export async function updateAdminTestimonial(id: string, testimonial: Partial<Testimonial>): Promise<Testimonial> {
  return api.put<Testimonial>(`/api/admin/testimonials/${id}`, testimonial);
}

export async function deleteAdminTestimonial(id: string): Promise<void> {
  await api.delete(`/api/admin/testimonials/${id}`);
}

// Export
export async function fetchAdminExport(type: string): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/api/admin/export?type=${encodeURIComponent(type)}`, {
    method: 'GET',
    headers: { Accept: 'text/csv' },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Export failed');
  }

  return response.blob();
}
