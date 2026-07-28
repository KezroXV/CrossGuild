import { z } from "zod";
import { MAX_CART_ITEM_QUANTITY } from "@/config/config";

export const addToCartSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
  quantity: z
    .number()
    .int()
    .min(1, "Quantity must be at least 1")
    .max(MAX_CART_ITEM_QUANTITY)
    .optional()
    .default(1),
});

export const updateCartItemSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
  quantity: z
    .number()
    .int()
    .min(1, "Quantity must be at least 1")
    .max(MAX_CART_ITEM_QUANTITY),
});

export const updateCartItemQuantitySchema = z.object({
  quantity: z
    .number()
    .int()
    .min(1, "Quantity must be at least 1")
    .max(MAX_CART_ITEM_QUANTITY),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type UpdateCartItemQuantityInput = z.infer<
  typeof updateCartItemQuantitySchema
>;
