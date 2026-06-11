import { z } from "zod";

export const emailSchema = z.string().email("Email khong hop le");

export const passwordSchema = z
  .string()
  .min(6, "Mat khau toi thieu 6 ky tu")
  .max(72, "Mat khau qua dai");
