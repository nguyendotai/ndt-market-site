import { http } from "@/services/http";
import type { Id } from "@/services/types";

export type CartItemDto = {
  id: Id;
  productId: Id;
  quantity: number;
  price?: number;
};

export type CartDto = {
  id: Id;
  items: CartItemDto[];
  subtotal?: number;
  discountTotal?: number;
  total?: number;
};

export type AddCartItemPayload = {
  productId: Id;
  quantity: number;
  variantId?: Id;
  storeId?: Id;
};

export type UpdateCartItemPayload = {
  quantity: number;
};

export const cartService = {
  getCart: () => http.get<CartDto>("/cart"),
  addItem: (payload: AddCartItemPayload) => http.post<CartDto>("/cart/items", payload),
  updateItem: (itemId: Id, payload: UpdateCartItemPayload) =>
    http.patch<CartDto>(`/cart/items/${itemId}`, payload),
  removeItem: (itemId: Id) => http.delete<CartDto>(`/cart/items/${itemId}`),
  clearCart: () => http.delete<CartDto>("/cart"),
  applyCoupon: (code: string) => http.post<CartDto>("/cart/coupons", { code }),
  removeCoupon: (code: string) => http.delete<CartDto>(`/cart/coupons/${code}`),
};
