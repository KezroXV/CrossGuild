import { API_BASE_URL } from "@/config/config";
import type {
  ActiveSession,
  ChangePasswordInput,
  ProfileUser,
  UpdateProfileInput,
  UserOrdersResponse,
} from "@/features/auth/types/profile.type";

async function parseResponse<T>(res: Response): Promise<T> {
  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Request failed"
    );
  }

  return data as T;
}

export async function fetchProfile(): Promise<ProfileUser> {
  const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
    credentials: "include",
  });

  return parseResponse<ProfileUser>(res);
}

export async function updateProfile(
  input: UpdateProfileInput
): Promise<ProfileUser> {
  const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseResponse<ProfileUser>(res);
}

export async function uploadProfileImage(
  file: File
): Promise<{ success: boolean; imageUrl: string }> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_BASE_URL}/api/user/profile/image`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  return parseResponse<{ success: boolean; imageUrl: string }>(res);
}

export async function changePassword(input: ChangePasswordInput) {
  const res = await fetch(`${API_BASE_URL}/api/user/password`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseResponse<{ success: boolean }>(res);
}

export async function fetchUserOrders(
  page: number,
  pageSize = 5
): Promise<UserOrdersResponse> {
  const res = await fetch(
    `${API_BASE_URL}/api/user/orders?page=${page}&pageSize=${pageSize}`,
    { credentials: "include" }
  );

  return parseResponse<UserOrdersResponse>(res);
}

export async function cancelUserOrder(orderId: string) {
  const res = await fetch(`${API_BASE_URL}/api/user/orders/${orderId}/cancel`, {
    method: "PUT",
    credentials: "include",
  });

  return parseResponse<{ success: boolean }>(res);
}

export async function fetchActiveSessions(): Promise<ActiveSession[]> {
  const res = await fetch(`${API_BASE_URL}/api/user/sessions`, {
    credentials: "include",
  });

  const data = await parseResponse<{ sessions: ActiveSession[] }>(res);
  return data.sessions ?? [];
}

export async function revokeSession(sessionId: string) {
  const res = await fetch(`${API_BASE_URL}/api/user/sessions/${sessionId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(
      typeof data.error === "string" ? data.error : "Failed to revoke session"
    );
  }
}
