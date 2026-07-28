import FooterSection from "@/shared/components/footer";
import Wishlist from "@/shared/components/wishlist";
import React from "react";

export default function WishlistPage() {
  return (
    <div className="pt-px min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col gap-8">
        <Wishlist />
      </main>
      <FooterSection />
    </div>
  );
}
