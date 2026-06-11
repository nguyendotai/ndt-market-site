import { http } from "@/services/http";
import type { DeliveryType } from "@/constants/deliveryType";
import type { Id } from "@/services/types";

export type DeliveryMethodDto = {
  id: string;
  name: string;
  type: DeliveryType;
  fee: number;
  estimatedMinutes?: number;
};

export type DeliveryFeePayload = {
  addressId: Id;
  cartId?: Id;
  deliveryType?: DeliveryType;
};

export type DeliveryFeeDto = {
  fee: number;
  deliveryType: DeliveryType;
  estimatedMinutes?: number;
};

export const deliveryService = {
  getDeliveryMethods: () => http.get<DeliveryMethodDto[]>("/delivery/methods"),
  calculateFee: (payload: DeliveryFeePayload) => http.post<DeliveryFeeDto>("/delivery/fee", payload),
  checkAvailability: (addressId: Id) =>
    http.get<{ available: boolean }>("/delivery/availability", { params: { addressId } }),
  getTimeSlots: (addressId?: Id) =>
    http.get<Array<{ id: string; label: string; available: boolean }>>("/delivery/time-slots", {
      params: { addressId },
    }),
};
