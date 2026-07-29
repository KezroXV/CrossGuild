import type { Metadata } from "next";
import ProfileView from "@/features/auth/views/profile.view";

export const metadata: Metadata = { title: "My Profile | CrossGuild" };

export default function ProfilePage() {
  return <ProfileView />;
}
