import { http } from "@/services/http";
import type { Id, ListQueryParams } from "@/services/types";

export type PaymentMethodDto = {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
};

export type PaymentDto = {
  id: Id;
  orderId: Id;
  amount: number;
  status: string;
  paymentUrl?: string;
};

export type CreatePaymentPayload = {
  orderId: Id;
  method: string;
  returnUrl?: string;
};

export const paymentService = {
  getPaymentMethods: () => http.get<PaymentMethodDto[]>("/payments/methods"),
  getPayments: (params?: ListQueryParams) => http.get<PaymentDto[]>("/payments", { params }),
  getPaymentById: (id: Id) => http.get<PaymentDto>(`/payments/${id}`),
  createPayment: (payload: CreatePaymentPayload) => http.post<PaymentDto>("/payments", payload),
  verifyPayment: (paymentId: Id, params?: Record<string, unknown>) =>
    http.post<PaymentDto>(`/payments/${paymentId}/verify`, params),
  cancelPayment: (paymentId: Id) => http.patch<PaymentDto>(`/payments/${paymentId}/cancel`),
};
