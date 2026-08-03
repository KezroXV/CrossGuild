import { API_BASE_URL } from "@/config/config";
import type {
  CartCountResponse,
  CartResponse,
  CreateOrderResponse,
} from "@/features/cart/types/cart.type";
import type { DeliveryInfo } from "@/features/cart/validations/cart.schema";

async function parseResponse<T>(res: Response): Promise<T> {
  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Request failed"
    );
  }

  return data as T;
}

export async function fetchCart(): Promise<CartResponse> {
  const res = await fetch(`${API_BASE_URL}/api/cart`, {
    credentials: "include",
  });

  return parseResponse<CartResponse>(res);
}

export async function fetchCartCount(): Promise<CartCountResponse> {
  const res = await fetch(`${API_BASE_URL}/api/cart/count`, {
    credentials: "include",
  });

  return parseResponse<CartCountResponse>(res);
}

export async function addToCartItem(
  itemId: string,
  quantity = 1,
  options?: { optionId: string; value: string }[]
) {
  const res = await fetch(`${API_BASE_URL}/api/cart`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemId, quantity, ...(options && { options }) }),
    cache: "no-store",
  });

  return parseResponse<{ success: boolean; error?: string }>(res);
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  const res = await fetch(`${API_BASE_URL}/api/cart`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemId, quantity }),
  });

  return parseResponse<{ success: boolean }>(res);
}

export async function removeCartItem(itemId: string) {
  const res = await fetch(`${API_BASE_URL}/api/cart?itemId=${itemId}`, {
    method: "DELETE",
    credentials: "include",
  });

  return parseResponse<{ success: boolean }>(res);
}

export async function createOrder(deliveryInfo: DeliveryInfo) {
  const res = await fetch(`${API_BASE_URL}/api/orders/create`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deliveryInfo }),
  });

  return parseResponse<CreateOrderResponse>(res);
}
