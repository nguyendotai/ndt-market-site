import { http } from "@/services/http";
import type { Id } from "@/services/types";

export type CartItemDto = {
  id?: Id;
  _id?: Id;
  productId?: Id;
  variantId?: Id;
  product?: Id | Record<string, unknown>;
  variant?: Id | Record<string, unknown>;
  quantity: number;
  quantityBase?: number;
  displayQuantity?: number;
  displayUnit?: string;
  inventoryUnit?: string;
  price?: number;
  priceSnapshot?: number;
  priceUnit?: string;
  saleType?: string;
  [key: string]: unknown;
};

export type CartDto = {
  id?: Id;
  _id?: Id;
  items: CartItemDto[];
  subtotal?: number;
  discountTotal?: number;
  total?: number;
  totalItems?: number;
  storeId?: Id;
  store?: Id | Record<string, unknown>;
  [key: string]: unknown;
};

export type AddCartItemPayload = {
  quantity?: number;
  quantityBase?: number;
  variant: Id;
};

export type UpdateCartItemPayload = {
  quantity?: number;
  quantityBase?: number;
};

export const cartService = {
  getCart: () => http.get<CartDto>("/cart"),
  addItem: (payload: AddCartItemPayload) => http.post<CartDto>("/cart/items", payload),
  updateItem: (itemId: Id, payload: UpdateCartItemPayload) =>
    http.patch<CartDto>(`/cart/items/${itemId}`, payload),
  removeItem: (itemId: Id) => http.delete<CartDto>(`/cart/items/${itemId}`),
  clearCart: () => http.delete<CartDto>("/cart/clear"),
  setStore: (storeId: Id) => http.patch<CartDto>("/cart/store", { store: storeId }),
  applyCoupon: (code: string) => http.post<CartDto>("/cart/coupons", { code }),
  removeCoupon: (code: string) => http.delete<CartDto>(`/cart/coupons/${code}`),
};
