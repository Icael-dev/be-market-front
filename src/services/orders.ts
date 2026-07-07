import { api } from '../lib/api';
import type { Order } from '../types';

export async function fetchOrders(): Promise<Order[]> {
  return api.get<Order[]>('/api/orders');
}

export async function fetchRecentOrders(limit = 3): Promise<Order[]> {
  return api.get<Order[]>(`/api/orders?limit=${limit}`);
}

export async function fetchOrderById(id: string): Promise<Order> {
  return api.get<Order>(`/api/orders/${id}`);
}

export async function placeOrder(payload: {
  shipping_address: Record<string, unknown>;
  billing_address?: Record<string, unknown>;
  payment_method?: string;
  notes?: string;
  coupon_code?: string;
}): Promise<Order> {
  return api.post<Order>('/api/checkout', payload);
}
