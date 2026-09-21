import { api } from "../lib/api";
import type { Payment } from "../types";

export async function initiatePayment(
  orderId: string,
  paymentMethod: string,
  phoneNumber?: string
): Promise<Payment & { redirect_url?: string | null }> {
  return api.post<Payment & { redirect_url?: string | null }>("/api/payment/initiate", {
    order_id: orderId,
    payment_method: paymentMethod,
    phone_number: phoneNumber,
  });
}

export async function verifyPayment(paymentId: string): Promise<Payment> {
  return api.get<Payment>(`/api/payment/verify/${paymentId}`);
}

export async function paymentCallback(
  reference: string,
  status: string,
  providerData?: Record<string, unknown>
): Promise<Payment> {
  return api.post<Payment>("/api/payment/callback", {
    external_id: reference,
    status,
    provider_data: providerData,
  });
}

export async function fetchPaymentHistory(): Promise<Payment[]> {
  return api.get<Payment[]>("/api/payment/history");
}
