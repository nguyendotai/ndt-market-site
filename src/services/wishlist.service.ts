import { http } from "@/services/http";
import type { Id, ListQueryParams } from "@/services/types";
import type { Product } from "@/types/product";

export type WishlistDto = {
  id: Id;
  products: Product[];
};

export const wishlistService = {
  getWishlist: (params?: ListQueryParams) => http.get<WishlistDto>("/wishlist", { params }),
  addToWishlist: (productId: Id) => http.post<WishlistDto>(`/wishlist/${productId}`),
  removeFromWishlist: (productId: Id) => http.delete<WishlistDto>(`/wishlist/${productId}`),
  toggleWishlist: (productId: Id) => http.post<WishlistDto>("/wishlist/toggle", { productId }),
  clearWishlist: () => http.delete<WishlistDto>("/wishlist"),
};
