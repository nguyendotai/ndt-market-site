import { http } from "@/services/http";
import type { OrderStatus } from "@/constants/orderStatus";
import type { PaymentStatus } from "@/constants/paymentStatus";
import type { Id, ListQueryParams } from "@/services/types";

export type OrderDto = {
  id: Id;
  code?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  total?: number;
  createdAt?: string;
};

export type CreateOrderPayload = {
  checkoutId?: Id;
  addressId?: Id;
  note?: string;
  paymentMethod?: string;
};

export const orderService = {
  getOrders: (params?: ListQueryParams) => http.get<OrderDto[]>("/orders", { params }),
  getOrderById: (id: Id) => http.get<OrderDto>(`/orders/${id}`),
  getOrderByCode: (code: string) => http.get<OrderDto>(`/orders/code/${code}`),
  createOrder: (payload: CreateOrderPayload) => http.post<OrderDto>("/orders", payload),
  cancelOrder: (id: Id, reason?: string) => http.patch<OrderDto>(`/orders/${id}/cancel`, { reason }),
  reorder: (id: Id) => http.post<OrderDto>(`/orders/${id}/reorder`),
};
