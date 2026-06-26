import { api } from '../lib/api';
import type { Address } from '../types';

export async function fetchAddresses(): Promise<Address[]> {
  return api.get<Address[]>('/api/addresses');
}

export async function createAddress(address: Omit<Address, 'id' | 'created_at'>): Promise<Address> {
  return api.post<Address>('/api/addresses', address);
}

export async function updateAddress(id: string, address: Partial<Address>): Promise<Address> {
  return api.put<Address>(`/api/addresses/${id}`, address);
}

export async function deleteAddress(id: string): Promise<void> {
  await api.delete(`/api/addresses/${id}`);
}
