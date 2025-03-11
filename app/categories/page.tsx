import { Navbar } from "@/components/navbar";
import React from "react";
import Catehero from "@/components/Categories/CateHero";
import CategoriesSection from "@/components/Categories/categoriesSection";
import { TopSellingGamingGear } from "@/components/TopSellingGamingGear";
import { Footer } from "@/components/ui/footer";
import FooterSection from "@/components/footer";
const page = () => {
  return (
    <div className="pt-4">
      <Navbar />
      <Catehero />
      <CategoriesSection />
      <TopSellingGamingGear />
      <FooterSection />
    </div>
  );
};

export default page;
