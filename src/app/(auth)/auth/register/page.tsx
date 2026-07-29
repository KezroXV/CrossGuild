import type { Metadata } from "next";
import RegisterView from "@/features/auth/views/register.view";

export const metadata: Metadata = { title: "Register | CrossGuild" };

export default function RegisterPage() {
  return <RegisterView />;
}
