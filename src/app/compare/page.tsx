"use client";

import { Navbar } from "@/shared/components/navbar";
import FooterSection from "@/shared/components/footer";
import ProductCompare from "@/shared/components/ProductCompare";

export default function ComparePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 mt-20">
        <ProductCompare />
      </main>
      <FooterSection />
    </div>
  );
}
