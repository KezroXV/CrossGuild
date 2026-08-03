import { z } from "zod";
import { OrderStatus } from "@prisma/client";

export const deliveryInfoSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phone: z.string().min(8, "Phone number must be at least 8 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  postalCode: z.string().min(3, "Postal code must be at least 3 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
});

export const createOrderSchema = z.object({
  deliveryInfo: deliveryInfoSchema,
});

export const userOrdersPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(5),
});

export const adminOrdersPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export const updateOrderSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  isPaid: z.boolean().optional(),
});

export type DeliveryInfo = z.infer<typeof deliveryInfoSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
