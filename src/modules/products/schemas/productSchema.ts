import { z } from "zod";

export const productFilterSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
});
