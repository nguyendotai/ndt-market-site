import { http } from "@/services/http";
import type { Product } from "@/types/product";
import type { Id, ListQueryParams } from "@/services/types";

export type ProductQueryParams = ListQueryParams & {
  keyword?: string;
  category?: string;
  categoryId?: Id;
  categorySlug?: string;
  brand?: string;
  brandId?: Id;
  brandSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  origin?: string;
  tags?: string;
  rating?: number;
  inStock?: boolean;
  storeId?: Id;
  isFeatured?: boolean;
  isPromotion?: boolean;
};

export const productService = {
  getProducts: (params?: ProductQueryParams) => http.get<Product[]>("/products", { params }),
  searchProducts: (params?: ProductQueryParams) => http.get<Product[]>("/products/search", { params }),
  getFeaturedProducts: (params?: ListQueryParams) =>
    http.get<Product[]>("/products/featured", { params }),
  getBestSellerProducts: (params?: ListQueryParams) =>
    http.get<Product[]>("/products/best-sellers", { params }),
  getPromotionProducts: (params?: ListQueryParams) =>
    http.get<Product[]>("/products/promotions", { params }),
  getProductsByCategory: (categoryIdOrSlug: Id) =>
    http.get<Product[]>(`/products/category/${categoryIdOrSlug}`),
  getProductsByBrand: (brandIdOrSlug: Id) => http.get<Product[]>(`/products/brand/${brandIdOrSlug}`),
  getRelatedProducts: (slug: Id) => http.get<Product[]>(`/products/${slug}/related`),
  getVariantInventory: (variantId: Id) =>
    http.get<{ variantId: Id; stock: number; inStock: boolean }>(`/products/${variantId}/inventory`),
  getProductById: (id: Id) => http.get<Product>(`/products/${id}`),
  getProductBySlug: (slug: string) => http.get<Product>(`/products/${slug}`),
};
