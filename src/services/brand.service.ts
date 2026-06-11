import { http } from "@/services/http";
import type { Id, ListQueryParams } from "@/services/types";

export type BrandDto = {
  id: Id;
  name: string;
  slug: string;
  logo?: string;
  productCount?: number;
};

export const brandService = {
  getBrands: (params?: ListQueryParams) => http.get<BrandDto[]>("/brands", { params }),
  getFeaturedBrands: () => http.get<BrandDto[]>("/brands/featured"),
  getBrandById: (id: Id) => http.get<BrandDto>(`/brands/${id}`),
  getBrandBySlug: (slug: string) => http.get<BrandDto>(`/brands/slug/${slug}`),
};
