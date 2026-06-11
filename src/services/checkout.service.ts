import { http } from "@/services/http";
import type { DeliveryType } from "@/constants/deliveryType";
import type { Id } from "@/services/types";
import type { CartDto } from "@/services/cart.service";
import type { OrderDto } from "@/services/order.service";

export type CheckoutDto = {
  id: Id;
  cart: CartDto;
  addressId?: Id;
  deliveryType?: DeliveryType;
  paymentMethod?: string;
  total?: number;
};

export type CreateCheckoutPayload = {
  cartId?: Id;
};

export type UpdateCheckoutPayload = {
  addressId?: Id;
  deliveryType?: DeliveryType;
  paymentMethod?: string;
  couponCode?: string;
  note?: string;
};

export const checkoutService = {
  getCheckout: () => http.get<CheckoutDto>("/checkout"),
  createCheckout: (payload?: CreateCheckoutPayload) => http.post<CheckoutDto>("/checkout", payload),
  updateCheckout: (payload: UpdateCheckoutPayload) => http.patch<CheckoutDto>("/checkout", payload),
  setAddress: (addressId: Id) => http.patch<CheckoutDto>("/checkout/address", { addressId }),
  setDelivery: (deliveryType: DeliveryType) =>
    http.patch<CheckoutDto>("/checkout/delivery", { deliveryType }),
  setPayment: (paymentMethod: string) =>
    http.patch<CheckoutDto>("/checkout/payment", { paymentMethod }),
  placeOrder: () => http.post<OrderDto>("/checkout/place-order"),
};
