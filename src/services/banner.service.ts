import { http } from "@/services/http";
import type { Id, ListQueryParams } from "@/services/types";

export type BannerDto = {
  id: Id;
  _id?: Id;
  title: string;
  image?: string;
  imageUrl?: string;
  desktopImage?: string;
  mobileImage?: string;
  thumbnail?: string;
  href?: string;
  link?: string;
  linkUrl?: string;
  position?: string;
  status?: "ACTIVE" | "INACTIVE" | string;
  sortOrder?: number;
};

export const bannerService = {
  getBanners: (params?: ListQueryParams) => http.get<BannerDto[]>("/banners", { params }),
  getHomeBanners: () => http.get<BannerDto[]>("/banners/home"),
  getBannersByPosition: (position: string) => http.get<BannerDto[]>(`/banners/position/${position}`),
  getBannerById: (id: Id) => http.get<BannerDto>(`/banners/${id}`),
};
