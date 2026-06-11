import { http } from "@/services/http";
import type { Id, ListQueryParams } from "@/services/types";

export type CategoryDto = {
  id: Id;
  _id?: Id;
  name: string;
  slug: string;
  description?: string;
  banner?: string;
  image?: string;
  parentId?: Id | null;
  children?: CategoryDto[];
  productCount?: number;
};

export const categoryService = {
  getCategories: (params?: ListQueryParams) => http.get<CategoryDto[]>("/categories", { params }),
  getCategoryTree: () => http.get<CategoryDto[]>("/categories/tree"),
  getFeaturedCategories: () => http.get<CategoryDto[]>("/categories/featured"),
  getCategoryById: (id: Id) => http.get<CategoryDto>(`/categories/${id}`),
  getCategoryBySlug: (slug: string) => http.get<CategoryDto>(`/categories/${slug}`),
};
