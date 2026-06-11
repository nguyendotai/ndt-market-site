import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/services/baseQuery";

export const api = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Product", "Cart", "Order", "User"],
  endpoints: () => ({}),
});
