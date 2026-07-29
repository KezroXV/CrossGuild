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

export const deliveryInfoSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phone: z.string().min(8, "Phone number must be at least 8 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  postalCode: z.string().min(3, "Postal code must be at least 3 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
});

export type DeliveryInfo = z.infer<typeof deliveryInfoSchema>;
