import { API_BASE_URL } from "@/config/config";
import type {
  AdminBrand,
  AdminCategoriesResponse,
  AdminCategory,
  AdminOrder,
  AdminOrdersResponse,
  AdminProduct,
  AdminProductFormInput,
  AdminProductsResponse,
  AdminRole,
  AdminUser,
  AdminUsersResponse,
  DashboardStats,
  PaginationParams,
} from "@/features/admin/types/admin.type";

async function parseResponse<T>(res: Response): Promise<T> {
  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Request failed"
    );
  }

  return data as T;
}

export async function fetchAdminStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE_URL}/api/admin/stats`, {
    credentials: "include",
  });

  return parseResponse<DashboardStats>(res);
}

export async function fetchAdminProducts(
  params: PaginationParams
): Promise<AdminProductsResponse> {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
  });

  const res = await fetch(
    `${API_BASE_URL}/api/admin/products?${searchParams}`,
    { credentials: "include" }
  );

  return parseResponse<AdminProductsResponse>(res);
}

export async function createAdminProduct(input: AdminProductFormInput) {
  const res = await fetch(`${API_BASE_URL}/api/admin/products`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, isPublished: true }),
  });

  return parseResponse<{ product: AdminProduct }>(res);
}

export async function updateAdminProduct(
  id: string,
  input: AdminProductFormInput
) {
  const res = await fetch(`${API_BASE_URL}/api/admin/products`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id,
      ...input,
      price: parseFloat(input.price),
      quantity: parseInt(input.quantity, 10),
      cost: parseFloat(input.cost),
      isPublished: true,
    }),
  });

  return parseResponse<{ product: AdminProduct }>(res);
}

export async function deleteAdminProduct(id: string) {
  const res = await fetch(`${API_BASE_URL}/api/admin/products`, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });

  return parseResponse<{ success: boolean }>(res);
}

export async function fetchAdminCategories(): Promise<AdminCategoriesResponse> {
  const res = await fetch(`${API_BASE_URL}/api/admin/categories`, {
    credentials: "include",
  });

  return parseResponse<AdminCategoriesResponse>(res);
}

export async function createAdminCategory(input: {
  name: string;
  description: string;
  image: string;
}) {
  const res = await fetch(`${API_BASE_URL}/api/admin/categories`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseResponse<{ category: AdminCategory }>(res);
}

export async function updateAdminCategory(input: {
  id: string;
  name: string;
  description: string;
  image: string;
}) {
  const res = await fetch(`${API_BASE_URL}/api/admin/categories`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseResponse<{ category: AdminCategory }>(res);
}

export async function deleteAdminCategory(id: string) {
  const res = await fetch(`${API_BASE_URL}/api/admin/categories`, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });

  return parseResponse<{ message: string }>(res);
}

export async function fetchBrands(): Promise<AdminBrand[]> {
  const res = await fetch(`${API_BASE_URL}/api/brands`, {
    credentials: "include",
  });

  return parseResponse<AdminBrand[]>(res);
}

export async function createBrand(formData: FormData) {
  const res = await fetch(`${API_BASE_URL}/api/brands`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  return parseResponse<AdminBrand>(res);
}

export async function updateBrand(id: string, formData: FormData) {
  const res = await fetch(`${API_BASE_URL}/api/brands/${id}`, {
    method: "PUT",
    credentials: "include",
    body: formData,
  });

  return parseResponse<AdminBrand>(res);
}

export async function deleteBrand(id: string) {
  const res = await fetch(`${API_BASE_URL}/api/brands/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  return parseResponse<AdminBrand>(res);
}

export async function uploadImages(files: File[]): Promise<string[]> {
  const uploadPromises = files.map(async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE_URL}/api/upload`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const data = await parseResponse<{ url: string }>(res);
    return data.url;
  });

  return Promise.all(uploadPromises);
}

export async function fetchAdminOrders(
  params: PaginationParams
): Promise<AdminOrdersResponse> {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
  });

  const res = await fetch(
    `${API_BASE_URL}/api/admin/orders?${searchParams}`,
    { credentials: "include" }
  );

  return parseResponse<AdminOrdersResponse>(res);
}

export async function fetchAdminOrderById(
  orderId: string
): Promise<AdminOrder> {
  const res = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}`, {
    credentials: "include",
  });

  return parseResponse<AdminOrder>(res);
}

export async function updateAdminOrderStatus(
  orderId: string,
  status: string
) {
  const res = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  return parseResponse<{ order: AdminOrder; success: boolean }>(res);
}

export async function fetchAdminUsers(): Promise<AdminUsersResponse> {
  const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
    credentials: "include",
  });

  return parseResponse<AdminUsersResponse>(res);
}

export async function fetchAdminRoles(): Promise<{ roles: AdminRole[] }> {
  const res = await fetch(`${API_BASE_URL}/api/admin/roles`, {
    credentials: "include",
  });

  return parseResponse<{ roles: AdminRole[] }>(res);
}

export async function updateAdminUser(input: {
  id: string;
  roleId?: string;
  isAdmin?: boolean;
}) {
  const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseResponse<AdminUser>(res);
}

export async function deleteAdminUser(id: string) {
  const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });

  return parseResponse<{ message: string }>(res);
}
