import type { Metadata } from "next";
import WishlistView from "@/features/wishlist/views/wishlist.view";

export const metadata: Metadata = { title: "Wishlist | CrossGuild" };

export default function WishlistPage() {
  return <WishlistView />;
}
