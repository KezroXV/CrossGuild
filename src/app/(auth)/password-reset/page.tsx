import type { Metadata } from "next";
import PasswordResetView from "@/features/auth/views/password-reset.view";

export const metadata: Metadata = { title: "Reset Password | CrossGuild" };

export default function PasswordResetPage() {
  return <PasswordResetView />;
}
