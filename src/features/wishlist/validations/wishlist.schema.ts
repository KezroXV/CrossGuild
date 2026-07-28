import { z } from "zod";

export const addToWishlistSchema = z.object({
  itemId: z.string().min(1, "L'ID de l'article est requis"),
});

export const wishlistItemIdQuerySchema = z.object({
  itemId: z.string().min(1, "L'ID de l'article est requis"),
});

export type AddToWishlistInput = z.infer<typeof addToWishlistSchema>;
