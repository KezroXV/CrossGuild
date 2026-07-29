import React from "react";
import Catehero from "@/shared/components/Categories/CateHero";
import CategoriesSection from "@/shared/components/Categories/categoriesSection";
import { TopSellingGamingGear } from "@/shared/components/TopSellingGamingGear";
import Brands from "@/shared/components/Categories/Brands";

const page = () => {
  return (
    <div className="flex flex-col gap-8">
      <Catehero />
      <CategoriesSection />
      <Brands />
      <TopSellingGamingGear />
    </div>
  );
};

export default page;
