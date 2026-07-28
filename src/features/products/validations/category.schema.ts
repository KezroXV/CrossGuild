import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  image: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.extend({
  id: z.string().min(1, "ID is required"),
});

export const deleteCategorySchema = z.object({
  id: z.string().min(1, "ID is required"),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
