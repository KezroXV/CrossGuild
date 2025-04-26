import { Navbar } from "@/components/navbar";
import React from "react";
import Catehero from "@/components/Categories/CateHero";
import CategoriesSection from "@/components/Categories/categoriesSection";
import { TopSellingGamingGear } from "@/components/TopSellingGamingGear";
import FooterSection from "@/components/footer";
import Brands from "@/components/Categories/Brands";
const page = () => {
  return (
    <div className="pt-px min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col gap-8">
        <Catehero />
        <CategoriesSection />
        <Brands />
        <TopSellingGamingGear />
      </main>
      <FooterSection />
    </div>
  );
};

export default page;
