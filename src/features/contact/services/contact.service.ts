import { API_BASE_URL } from "@/config/config";

export type ContactFormInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
  department: string;
};

export async function submitContactForm(data: ContactFormInput): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/contact`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(
      typeof json.error === "string" ? json.error : "Failed to send message"
    );
  }
}
