import { z } from "zod";

export const productFilterSchema = z.object({
  keyword: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  origin: z.string().optional(),
  tags: z.string().optional(),
  rating: z.coerce.number().optional(),
  inStock: z.coerce.boolean().optional(),
  storeId: z.string().optional(),
  sort: z
    .enum([
      "newest",
      "oldest",
      "price_asc",
      "price_desc",
      "best_selling",
      "rating",
      "sold_desc",
      "rating_desc",
    ])
    .optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});
