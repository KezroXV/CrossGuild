import { z } from "zod";

export const reviewsByProductQuerySchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
});

export const createReviewSchema = z.object({
  itemId: z.string().min(1, "Item ID and rating are required"),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export const adminCreateReviewSchema = z.object({
  content: z.string().min(1, "Review content is required"),
  rating: z.coerce.number().int().min(1).max(5),
  userId: z.string().min(1, "User ID is missing. Please log in again."),
  itemId: z.string().min(1, "Product ID is required"),
});

export const moderateReviewSchema = z.object({
  id: z.string().min(1),
  data: z.object({
    content: z.string().optional(),
    rating: z.coerce.number().int().min(1).max(5).optional(),
    userId: z.string().optional(),
    itemId: z.string().optional(),
  }),
});

export const deleteReviewQuerySchema = z.object({
  id: z.string().min(1, "Review ID is required"),
});

export const adminDeleteReviewSchema = z.object({
  id: z.string().min(1, "Review ID is required"),
  type: z.string().optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type AdminCreateReviewInput = z.infer<typeof adminCreateReviewSchema>;
export type ModerateReviewInput = z.infer<typeof moderateReviewSchema>;
