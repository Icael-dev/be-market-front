import { api } from '../lib/api';
import type { SupportTicket, SupportMessage } from '../types';

export async function fetchSupportTickets(): Promise<SupportTicket[]> {
  return api.get<SupportTicket[]>('/api/support/tickets');
}

export async function fetchSupportTicket(id: string): Promise<SupportTicket> {
  return api.get<SupportTicket>(`/api/support/tickets/${id}`);
}

export async function createSupportTicket(payload: { subject: string; message: string; priority?: string }): Promise<SupportTicket> {
  return api.post<SupportTicket>('/api/support/tickets', payload);
}

export async function createSupportMessage(ticketId: string, message: string): Promise<SupportMessage> {
  return api.post<SupportMessage>(`/api/support/tickets/${ticketId}/messages`, { message });
}
