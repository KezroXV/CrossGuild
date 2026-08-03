import { OrderStatus } from "@prisma/client";

export type ProfileUser = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  image: string | null;
  city?: string | null;
};

export type UserOrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  images?: { url: string }[];
  product?: { name: string };
  unitPrice?: number;
};

export type UserOrder = {
  id: string;
  orderNumber: string;
  createdAt: string;
  totalAmount: number;
  status: OrderStatus;
  items: UserOrderItem[];
};

export type UserOrdersResponse = {
  orders: UserOrder[];
  currentPage: number;
  totalPages: number;
  totalOrders: number;
};

export type ActiveSession = {
  id: string;
  sessionToken: string;
  userId: string;
  expires: string;
  userAgent?: string;
  lastActive?: string;
  ip?: string;
};

export type UpdateProfileInput = {
  name: string;
  email: string;
  phone?: string;
  city?: string;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};
