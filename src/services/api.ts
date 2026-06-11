import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/services/baseQuery";

export const api = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery(),
  tagTypes: [
    "Address",
    "Article",
    "Banner",
    "Brand",
    "Cart",
    "Category",
    "Coupon",
    "Delivery",
    "Order",
    "Payment",
    "Product",
    "Promotion",
    "Review",
    "Store",
    "User",
    "Wishlist",
  ],
  endpoints: () => ({}),
});
