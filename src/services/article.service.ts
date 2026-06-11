import { http } from "@/services/http";
import type { Id, ListQueryParams } from "@/services/types";

export type ArticleDto = {
  id: Id;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  thumbnail?: string;
  publishedAt?: string;
};

export const articleService = {
  getArticles: (params?: ListQueryParams) => http.get<ArticleDto[]>("/articles", { params }),
  getFeaturedArticles: (params?: ListQueryParams) =>
    http.get<ArticleDto[]>("/articles/featured", { params }),
  getArticleById: (id: Id) => http.get<ArticleDto>(`/articles/${id}`),
  getArticleBySlug: (slug: string) => http.get<ArticleDto>(`/articles/slug/${slug}`),
};
