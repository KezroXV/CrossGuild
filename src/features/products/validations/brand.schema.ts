import { z } from "zod";

export const logoUrlSchema = z
  .string()
  .refine(
    (url) =>
      url.startsWith("http") ||
      url.startsWith("/uploads/") ||
      url.includes("cloudinary.com"),
    {
      message:
        "Logo must be a valid URL (http(s)://, /uploads/... or cloudinary.com)",
    }
  );

export const createBrandSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  logo: logoUrlSchema.optional(),
});

export const updateBrandSchema = createBrandSchema.extend({
  id: z.string().min(1, "Brand ID is required"),
});

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
