import { http } from "@/services/http";
import type { Id, ListQueryParams } from "@/services/types";
import type { Product } from "@/types/product";

export type PromotionDto = {
  id: Id;
  title: string;
  slug: string;
  banner?: string;
  startsAt?: string;
  endsAt?: string;
};

export const promotionService = {
  getPromotions: (params?: ListQueryParams) => http.get<PromotionDto[]>("/promotions", { params }),
  getActivePromotions: (params?: ListQueryParams) =>
    http.get<PromotionDto[]>("/promotions/active", { params }),
  getPromotionById: (id: Id) => http.get<PromotionDto>(`/promotions/${id}`),
  getPromotionBySlug: (slug: string) => http.get<PromotionDto>(`/promotions/slug/${slug}`),
  getPromotionProducts: (idOrSlug: Id) => http.get<Product[]>(`/promotions/${idOrSlug}/products`),
};
