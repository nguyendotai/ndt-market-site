import { api } from "@/services/api";
import type { ProductListItem } from "@/modules/products/types";

export const productsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<ProductListItem[], void>({
      query: () => ({ url: "/products" }),
      providesTags: ["Product"],
    }),
  }),
});

export const { useGetProductsQuery } = productsApi;
