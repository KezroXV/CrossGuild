import type { Metadata } from "next";
import LoginView from "@/features/auth/views/login.view";

export const metadata: Metadata = { title: "Sign In | CrossGuild" };

export default function LoginPage() {
  return <LoginView />;
}
