import { http } from "@/services/http";
import type { Id, ListQueryParams } from "@/services/types";

export type CouponDto = {
  id: Id;
  code: string;
  title?: string;
  discountValue?: number;
  discountType?: "fixed" | "percent";
  expiresAt?: string;
};

export type ValidateCouponPayload = {
  code: string;
  subtotal?: number;
};

export const couponService = {
  getCoupons: (params?: ListQueryParams) => http.get<CouponDto[]>("/coupons", { params }),
  getAvailableCoupons: (params?: ListQueryParams) =>
    http.get<CouponDto[]>("/coupons/available", { params }),
  getCouponByCode: (code: string) => http.get<CouponDto>(`/coupons/code/${code}`),
  validateCoupon: (payload: ValidateCouponPayload) => http.post<CouponDto>("/coupons/validate", payload),
};
