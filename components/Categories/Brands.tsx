"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

interface Brand {
  id: string;
  name: string;
  logo: string;
  description?: string;
  itemCount: number;
  slug: string; // Ajout du champ slug
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
        {brands.map((brand) => {
          // Générer un slug basé sur le nom si aucun slug n'existe
          const brandSlug =
            brand.slug || brand.name.toLowerCase().replace(/ /g, "-");

          return (
            <Link
              key={brand.id}
              href={`/brands/${brandSlug}`}
              className="block"
            >
              <Card className="overflow-hidden shadow-md border-4 cursor-pointer p-2 hover:border-accent transition">
                <CardContent className="p-2 flex flex-col items-center">
                  <div className="relative w-full aspect-square max-w-[150px]">
                    {" "}
                    <Image
                      src={brand.logo || "/images/placeholder-product.svg"}
                      alt={brand.name}
                      fill
                      className="object-contain p-1"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== "/images/placeholder-product.svg") {
                          target.src = "/images/placeholder-product.svg";
                        }
                      }}
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <h2 className="font-bold text-lg">{brand.name}</h2>
                    {brand.description && (
                      <p className="text-muted-foreground text-sm mt-1">
                        {brand.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {brand.itemCount} products
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Brands;
