import { OrderStatus } from "@prisma/client";

export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalItems: number;
  revenue: number;
  recentOrders: Array<{
    id: string;
    total: number;
    status: OrderStatus;
    user: { name: string };
  }>;
  newUsers: Array<{
    id: string;
    name: string | null;
    image: string | null;
    createdAt: string;
  }>;
  recentReviews: Array<{
    id: string;
    content: string;
    rating: number;
    createdAt: string;
    user: {
      name: string | null;
      image: string | null;
    };
    item: {
      name: string;
    };
  }>;
}

export interface AdminProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description?: string;
  images: { id: string; url: string }[];
  category?: { id: string; name: string };
  brand?: { id: string; name: string };
  brandId?: string;
  cost?: number;
  margin?: number;
  options: Array<{
    id: string;
    name: string;
    values: string[];
  }>;
}

export interface AdminProductsResponse {
  products: AdminProduct[];
  totalPages?: number;
}

export interface AdminProductFormInput {
  name: string;
  price: string;
  quantity: string;
  description: string;
  categoryId: string;
  images: string[];
  brandId: string;
  cost: string;
  options: Array<{
    name: string;
    values: string[];
  }>;
  isPublished?: boolean;
}

export interface AdminCategory {
  id: string;
  name: string;
  description?: string;
  image?: string;
  createdAt: string;
}

export interface AdminCategoriesResponse {
  categories: AdminCategory[];
  totalPages?: number;
  total?: number;
}

export interface AdminBrand {
  id: string;
  name: string;
  description?: string;
  logo?: string;
}

export interface AdminOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  city?: string;
  options?: Array<{
    name: string;
    values: string[];
  }>;
}

export interface AdminOrder {
  id: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  city?: string;
  user?: {
    name?: string;
    email?: string;
    phone?: string;
    city?: string;
  };
  items: AdminOrderItem[];
}

export interface AdminOrdersResponse {
  orders: AdminOrder[];
  totalPages: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  totalPages?: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface AdminReview {
  id: string;
  content: string;
  rating: number;
  userId: string;
  itemId: string;
  createdAt: string;
  user: {
    name: string;
    image: string | null;
  };
  item: {
    name: string;
  };
}

export interface AdminFAQ {
  id: string;
  question: string;
  answer: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  department: string;
  createdAt: string;
  isResolved: boolean;
}

export interface AdminReviewsResponse {
  reviews: AdminReview[];
  success?: boolean;
}

export interface AdminFaqsResponse {
  faqs: AdminFAQ[];
  totalCount: number;
  totalPages: number;
}

export interface AdminContactsResponse {
  contacts: AdminContactMessage[];
  totalCount: number;
  totalPages: number;
}

export interface AdminReviewFormInput {
  content: string;
  rating: number;
  userId: string;
  itemId: string;
}

export interface AdminFaqFormInput {
  question: string;
  answer: string;
  isPublished: boolean;
}

export interface AdminListParams extends PaginationParams {
  search?: string;
}
