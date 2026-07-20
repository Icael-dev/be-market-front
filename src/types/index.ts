export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  deleted_at?: string | null;
  specs?: { key: string; placeholder?: string }[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  price: number;
  compare_price: number | null;
  effective_price?: number;
  flash_discount_percentage?: number;
  stock: number;
  category_id: string | null;
  images: string[];
  specs: Record<string, string>;
  is_featured: boolean;
  is_active: boolean;
  weight: number | null;
  short_description: string | null;
  cost_price: number | null;
  dimensions: { length: number; width: number; height: number } | null;
  min_stock_alert: number | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  variants: { sizes: string[]; colors: { name: string; hex: string }[] } | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  category?: Category;
}

export type UserRole = 'admin' | 'staff' | 'client';

export interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  role?: UserRole;
  created_at: string;
  updated_at: string;
}

export interface StaffUser {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  role: UserRole;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string | null;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  region: string | null;
  country: string;
  postal_code: string | null;
  is_default: boolean;
  created_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  product?: Product;
}

export interface Cart {
  id: string;
  user_id: string | null;
  session_id: string | null;
  items: CartItem[];
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod | null;
  subtotal: number;
  discount: number;
  shipping_fee: number;
  tax: number;
  total: number;
  shipping_address: ShippingAddress;
  billing_address: ShippingAddress | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_sku: string | null;
  price: number;
  quantity: number;
  total: number;
}

export interface Payment {
  id: string;
  order_id: string;
  user_id?: string | null;
  payment_method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  reference: string | null;
  phone_number: string | null;
  provider_response: Record<string, unknown> | null;
  paid_at: string | null;
  created_at: string;
  order?: Order;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  is_verified_purchase: boolean;
  created_at: string;
  user?: {
    id: string;
    profile?: Profile;
  };
}

export interface Testimonial {
  id: string;
  full_name: string;
  role: string | null;
  comment: string;
  rating: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  button_text: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  image_url: string | null;
  author_id: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  shipping_fee: number;
  free_shipping_threshold: number;
  tax_rate: number;
  currency: string;
  store_name: string;
  store_email: string;
  store_phone: string;
  site_description?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number | null;
  max_uses: number | null;
  uses_count: number;
  starts_at: string;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  is_active: boolean;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

export interface StockNotification {
  id: string;
  user_id: string | null;
  product_id: string;
  email: string;
  is_notified: boolean;
  created_at: string;
  product?: Product;
}

export interface SupportTicket {
  id: string;
  user_id: string | null;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  messages?: SupportMessage[];
  profile?: Profile;
  user?: {
    id: string;
    email: string;
    profile?: Profile;
  };
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  user_id: string | null;
  message: string;
  is_from_admin: boolean;
  created_at: string;
  profile?: Profile;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface LegalPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  updated_at: string;
}

export interface FlashSale {
  id: string;
  product_id: string;
  discount_percentage: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  product?: Product;
}

export interface LoyaltyPoints {
  id: string;
  user_id: string;
  points: number;
  total_earned: number;
  total_redeemed: number;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyTransaction {
  id: string;
  user_id: string;
  order_id?: string | null;
  type: 'earned' | 'redeemed' | 'expired';
  points: number;
  description: string | null;
  reference?: string | null;
  created_at: string;
  order?: Order;
}

export interface ShippingAddress {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  region?: string;
  country: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'tmoney' | 'flooz' | 'cash_on_delivery';

export interface FilterOptions {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  brand?: string;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'name_asc' | 'name_desc';
}