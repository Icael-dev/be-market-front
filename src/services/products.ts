import { api } from '../lib/api';
import type { Product, Category, FilterOptions } from '../types';

export async function fetchCategories(): Promise<Category[]> {
  return api.get<Category[]>('/api/categories');
}

export async function fetchFeaturedProducts(limit = 8): Promise<Product[]> {
  return api.get<Product[]>(`/api/products?featured=true&limit=${limit}`);
}

export async function fetchProducts(filters: FilterOptions = {}): Promise<Product[]> {
  const params = new URLSearchParams();

  if (filters.category) {
    params.set('category', filters.category);
  }
  if (filters.search) {
    params.set('search', filters.search);
  }
  if (filters.brand) {
    params.set('brand', filters.brand);
  }
  if (filters.minPrice !== undefined) {
    params.set('min_price', String(filters.minPrice));
  }
  if (filters.maxPrice !== undefined) {
    params.set('max_price', String(filters.maxPrice));
  }
  if (filters.sort) {
    params.set('sort', filters.sort);
  }
  if (filters.flash_sale) {
    params.set('flash_sale', 'true');
  }
  if (filters.condition) {
    params.set('condition', filters.condition);
  }
  if (filters.in_stock) {
    params.set('in_stock', 'true');
  }
  if (filters.on_sale) {
    params.set('on_sale', 'true');
  }

  const query = params.toString();
  return api.get<Product[]>(`/api/products${query ? `?${query}` : ''}`);
}

export async function fetchProductBySlug(slug: string): Promise<Product> {
  return api.get<Product>(`/api/products/${encodeURIComponent(slug)}`);
}

export async function fetchRelatedProducts(categoryId: string, excludeId: string, limit = 4): Promise<Product[]> {
  const params = new URLSearchParams({ category_id: categoryId, exclude_id: excludeId, limit: String(limit) });
  return api.get<Product[]>(`/api/products?${params.toString()}`);
}

export async function fetchPriceBounds(category?: string, search?: string, brand?: string): Promise<{ min: number; max: number }> {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (search) params.set('search', search);
  if (brand) params.set('brand', brand);
  return api.get<{ min: number; max: number }>(`/api/products/price-bounds${params.toString() ? `?${params.toString()}` : ''}`);
}
