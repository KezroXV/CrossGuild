"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import { AnimatedCircularProgressBar } from "../magicui/animated-circular-progress-bar";

interface Brand {
  id: string;
  name: string;
  logo: string;
  description?: string;
  itemCount: number;
}

const Brands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch("/api/brands");
        const data = await response.json();
        setBrands(data);
      } catch (error) {
        console.error("Failed to fetch brands:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrands();
  }, []);

  if (isLoading) {
    return <div className="container mx-auto py-8">Chargement...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold text-accent text-center mb-12">
        Brands
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {brands.map((brand) => (
          <Card
            key={brand.id}
            className="overflow-hidden shadow-md border-4 cursor-pointer p-2"
          >
            <CardContent className="p-2 flex flex-col items-center">
              <div className="relative w-full aspect-square max-w-[150px]">
                <Image
                  src={brand.logo || "/images/placeholder.jpg"}
                  alt={brand.name}
                  fill
                  className="object-contain p-1"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Brands;
