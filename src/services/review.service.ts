import { http } from "@/services/http";
import type { Id, ListQueryParams } from "@/services/types";

export type ReviewDto = {
  id: Id;
  productId: Id;
  userId?: Id;
  userName?: string;
  rating: number;
  content: string;
  createdAt?: string;
};

export type CreateReviewPayload = {
  productId: Id;
  rating: number;
  content: string;
  orderItemId?: Id;
};

export type UpdateReviewPayload = {
  rating?: number;
  content?: string;
};

export const reviewService = {
  getProductReviews: (productSlugOrId: Id, params?: ListQueryParams) =>
    http.get<ReviewDto[]>(`/products/${productSlugOrId}/reviews`, { params }),
  getMyReviews: (params?: ListQueryParams) => http.get<ReviewDto[]>("/reviews/me", { params }),
  createReview: (payload: CreateReviewPayload) =>
    http.post<ReviewDto>(`/products/${payload.productId}/reviews`, payload),
  updateReview: (id: Id, payload: UpdateReviewPayload) => http.patch<ReviewDto>(`/reviews/${id}`, payload),
  deleteReview: (id: Id) => http.delete<null>(`/reviews/${id}`),
};
