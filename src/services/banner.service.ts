import { http } from "@/services/http";
import type { Id, ListQueryParams } from "@/services/types";

export type BannerDto = {
  id: Id;
  title: string;
  image: string;
  href?: string;
  position?: string;
};

export const bannerService = {
  getBanners: (params?: ListQueryParams) => http.get<BannerDto[]>("/banners", { params }),
  getHomeBanners: () => http.get<BannerDto[]>("/banners/home"),
  getBannersByPosition: (position: string) => http.get<BannerDto[]>(`/banners/position/${position}`),
  getBannerById: (id: Id) => http.get<BannerDto>(`/banners/${id}`),
};
