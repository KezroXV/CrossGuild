import { z } from "zod";

const imageUrlSchema = z
  .string()
  .refine(
    (url) =>
      url.startsWith("http") ||
      url.startsWith("/uploads/") ||
      url.includes("cloudinary.com"),
    {
      message:
        "Each image must be a valid URL (http(s)://, /uploads/... or cloudinary.com)",
    }
  );

const productOptionSchema = z.object({
  name: z.string().min(1),
  values: z.array(z.string()),
});

export const productListQuerySchema = z.object({
  sort: z.enum(["topSelling"]).optional(),
});

export const relatedProductsQuerySchema = z.object({
  categoryId: z.string().min(1, "Category ID is required"),
  excludeId: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(4),
});

export const searchQuerySchema = z.object({
  q: z.string().optional(),
});

export const adminProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.enum(["topSelling", "price", "createdAt"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  category: z.string().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(0).default(0),
});

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.coerce.number(),
  quantity: z.coerce.number().int(),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  images: z.array(imageUrlSchema).optional(),
  options: z.array(productOptionSchema).optional(),
  cost: z.coerce.number().optional(),
  isPublished: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema
  .partial()
  .extend({
    id: z.string().min(1, "Product ID is required"),
  });

export const deleteProductSchema = z.object({
  id: z.string().min(1, "Product ID is required"),
});

export const updateStockSchema = z.object({
  itemId: z.string().min(1, "Product ID is required"),
  quantity: z.coerce.number().int().min(0),
});

export type ProductListQuery = z.infer<typeof productListQuerySchema>;
export type RelatedProductsQuery = z.infer<typeof relatedProductsQuerySchema>;
export type AdminProductsQuery = z.infer<typeof adminProductsQuerySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
