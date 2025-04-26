import FooterSection from "@/components/footer";
import { Navbar } from "@/components/navbar";
import Wishlist from "@/components/wishlist";
import React from "react";

export default function WishlistPage() {
  return (
    <div className="pt-px min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col gap-8">
        <Wishlist />
      </main>
      <FooterSection />
    </div>
  );
}
