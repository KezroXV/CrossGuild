import { API_BASE_URL } from "@/config/config";
import type { RegisterInput } from "@/features/auth/validations/auth.schema";

export async function registerUser(data: RegisterInput) {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error || "An error occurred");
  }

  return json;
}

export async function uploadProfileImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/api/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Failed to upload profile image");
  }

  const data = await res.json();
  return data.url as string;
}

export async function requestPasswordReset(email: string) {
  const res = await fetch(`${API_BASE_URL}/api/password-reset/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error || "An error occurred");
  }

  return json;
}

export async function verifyPasswordResetToken(token: string) {
  const res = await fetch(`${API_BASE_URL}/api/password-reset/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  return res.json() as Promise<{
    valid: boolean;
    email?: string;
    error?: string;
  }>;
}

export async function resetPassword(token: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/api/password-reset/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error || "An error occurred");
  }

  return json;
}
