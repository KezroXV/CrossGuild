import { Navbar } from "@/components/navbar";
import React from "react";
import Catehero from "@/components/Categories/CateHero";
import CategoriesSection from "@/components/Categories/categoriesSection";
import { TopSellingGamingGear } from "@/components/TopSellingGamingGear";
const page = () => {
  return (
    <div className="pt-4">
      <Navbar />
      <Catehero />
      <CategoriesSection />
      <TopSellingGamingGear />
    </div>
  );
};

export default page;
