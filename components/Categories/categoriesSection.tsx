"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  image: string;
  description?: string;
}

const formatCategorySlug = (name: string) => {
  return name.toLowerCase().replace(/\s+/g, "-");
};

const CategoriesSection = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (isLoading) {
    return <div className="container mx-auto py-8">Chargement...</div>;
  }

  return (
    <div id="categories" className="container mx-auto py-8">
      <h1 className="text-2xl font-bold text-accent text-center mb-12">
        Categories
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Link
            href={`/categories/${formatCategorySlug(category.name)}`}
            key={category.id}
          >
            <Card className="overflow-hidden shadow-md border-4 cursor-pointer p-4 hover:border-accent transition-colors">
              <CardContent className="p-4 flex flex-col items-center">
                <div className="relative w-full aspect-square max-w-[200px]">
                  {" "}
                  <Image
                    src={category.image || "/images/placeholder-product.svg"}
                    alt={category.name}
                    fill
                    className="object-contain p-2"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== "/images/placeholder-product.svg") {
                        target.src = "/images/placeholder-product.svg";
                      }
                    }}
                  />
                </div>
              </CardContent>
              <CardFooter className="p-2">
                <h3 className="text-lg mx-auto font-semibold">
                  {category.name}
                </h3>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoriesSection;
