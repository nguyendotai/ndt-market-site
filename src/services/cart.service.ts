import { http } from "@/services/http";
import type { Id } from "@/services/types";

export type CartItemDto = {
  id: Id;
  _id?: Id;
  productId: Id;
  variantId?: Id;
  quantity: number;
  price?: number;
  [key: string]: unknown;
};

export type CartDto = {
  id: Id;
  _id?: Id;
  items: CartItemDto[];
  subtotal?: number;
  discountTotal?: number;
  total?: number;
  storeId?: Id;
  [key: string]: unknown;
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
  clearCart: () => http.delete<CartDto>("/cart/clear"),
  setStore: (storeId: Id) => http.patch<CartDto>("/cart/store", { storeId }),
  applyCoupon: (code: string) => http.post<CartDto>("/cart/coupons", { code }),
  removeCoupon: (code: string) => http.delete<CartDto>(`/cart/coupons/${code}`),
};
