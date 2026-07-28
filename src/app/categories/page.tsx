import { Navbar } from "@/shared/components/navbar";
import React from "react";
import Catehero from "@/shared/components/Categories/CateHero";
import CategoriesSection from "@/shared/components/Categories/categoriesSection";
import { TopSellingGamingGear } from "@/shared/components/TopSellingGamingGear";
import FooterSection from "@/shared/components/footer";
import Brands from "@/shared/components/Categories/Brands";
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
