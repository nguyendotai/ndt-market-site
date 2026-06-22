import { http } from "@/services/http";
import type { Product } from "@/types/product";
import type { Id, ListQueryParams } from "@/services/types";

export type ProductQueryParams = ListQueryParams & {
  keyword?: string;
  category?: string;
  brand?: string;
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
  searchProducts: (params?: ProductQueryParams) => http.get<Product[]>("/products", { params }),
  getFeaturedProducts: (params?: ListQueryParams) =>
    http.get<Product[]>("/products", { params: { ...params, isFeatured: true } }),
  getBestSellerProducts: (params?: ListQueryParams) =>
    http.get<Product[]>("/products", { params: { ...params, sort: params?.sort ?? "best_selling" } }),
  getPromotionProducts: (params?: ListQueryParams) =>
    http.get<Product[]>("/products", { params: { ...params, isPromotion: true } }),
  getProductsByCategory: (categoryIdOrSlug: Id) =>
    http.get<Product[]>("/products", { params: { category: categoryIdOrSlug } }),
  getProductsByBrand: (brandIdOrSlug: Id) =>
    http.get<Product[]>("/products", { params: { brand: brandIdOrSlug } }),
  getRelatedProducts: (slug: Id) => http.get<Product[]>(`/products/${slug}/related`),
  getVariantInventory: (variantId: Id, storeId?: Id) =>
    http.get<Array<{
      variantId?: Id;
      storeId?: Id;
      store?: Id | { _id?: Id; id?: Id };
      stock?: number;
      availableStock?: number;
      quantityBase?: number;
      reservedQuantityBase?: number;
      availableQuantityBase?: number;
      inStock?: boolean;
    }>>(
      `/products/${variantId}/inventory`,
      { params: { store: storeId, storeId } },
    ),
  getProductById: (id: Id) => http.get<Product>(`/products/${id}`),
  getProductBySlug: (slug: string) => http.get<Product>(`/products/${slug}`),
};
