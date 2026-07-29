import { API_BASE_URL } from "@/config/config";
import type {
  WishlistActionResponse,
  WishlistCheckResponse,
  WishlistCountResponse,
  WishlistResponse,
} from "@/features/wishlist/types/wishlist.type";

async function parseResponse<T>(res: Response): Promise<T> {
  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Request failed"
    );
  }

  return data as T;
}

export async function fetchWishlist(): Promise<WishlistResponse> {
  const res = await fetch(`${API_BASE_URL}/api/wishlist`, {
    credentials: "include",
  });

  return parseResponse<WishlistResponse>(res);
}

export async function fetchWishlistCount(): Promise<WishlistCountResponse> {
  const res = await fetch(`${API_BASE_URL}/api/wishlist/count`, {
    credentials: "include",
  });

  const data = await res.json();
  return data as WishlistCountResponse;
}

export async function checkWishlistItem(
  itemId: string
): Promise<WishlistCheckResponse> {
  const res = await fetch(
    `${API_BASE_URL}/api/wishlist/check?itemId=${itemId}`,
    { credentials: "include" }
  );

  const data = await res.json();
  return data as WishlistCheckResponse;
}

export async function addWishlistItem(itemId: string) {
  const res = await fetch(`${API_BASE_URL}/api/wishlist`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemId }),
  });

  return parseResponse<WishlistActionResponse>(res);
}

export async function removeWishlistItem(itemId: string) {
  const res = await fetch(`${API_BASE_URL}/api/wishlist?itemId=${itemId}`, {
    method: "DELETE",
    credentials: "include",
  });

  return parseResponse<WishlistActionResponse>(res);
}

export async function addWishlistItemToCart(itemId: string, quantity = 1) {
  const res = await fetch(`${API_BASE_URL}/api/cart`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemId, quantity }),
  });

  return parseResponse<{ success: boolean; error?: string }>(res);
}
