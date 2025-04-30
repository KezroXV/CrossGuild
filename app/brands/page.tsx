"use client";
import FooterSection from "@/components/footer";
import { Navbar } from "@/components/navbar";
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

export default function BrandsPage() {
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

  return (
    <div className="pt-px min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col gap-8">
        <div className="container mx-auto py-8">
          <h1 className="text-2xl font-bold text-accent text-center mb-12">
            Brands
          </h1>
          {isLoading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/brands/${brand.slug}`} // Utilisation du slug ici
                  className="block"
                >
                  <Card className="overflow-hidden shadow-md border-4 cursor-pointer p-2 hover:border-accent transition">
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
              ))}
            </div>
          )}
        </div>
      </main>
      <FooterSection />
    </div>
  );
}
