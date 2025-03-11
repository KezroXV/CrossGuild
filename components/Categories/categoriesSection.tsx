"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
  image: string;
  description?: string;
}

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
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold text-accent text-center mb-12">
        Categories
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Card
            key={category.id}
            className="overflow-hidden shadow-md border-4 cursor-pointer p-4"
          >
            <CardContent className="p-4 flex flex-col items-center">
              <div className="relative w-[150px] h-[150px] rounded-lg overflow-hidden">
                <Image
                  src={category.image || "/images/placeholder.jpg"}
                  alt={category.name}
                  fill
                  className="object-cover"
                />
              </div>
            </CardContent>
            <CardFooter className="p-2">
              <h3 className="text-lg mx-auto font-semibold">{category.name}</h3>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CategoriesSection;
