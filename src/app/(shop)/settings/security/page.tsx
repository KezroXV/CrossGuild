import type { Metadata } from "next";
import SecuritySettingsView from "@/features/auth/views/security-settings.view";

export const metadata: Metadata = { title: "Security Settings | CrossGuild" };

export default function SecuritySettingsPage() {
  return <SecuritySettingsView />;
}
