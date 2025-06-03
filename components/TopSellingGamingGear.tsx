"use client";
import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";

interface Product {
  id: string;
  name: string;
  price: number;
  averageRating: number; // Changé de rating à averageRating pour correspondre au schema
  images: { url: string }[];
  brand?: { name: string }; // Rendu optionnel
  quantity: number;
  topSelling: number;
  slug: string; // Added slug property
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const slideFromBottom = {
  hidden: { opacity: 0, y: 100 },
  visible: { opacity: 1, y: 0 },
};

export const TopSellingGamingGear = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchTopSellingProducts = async () => {
      try {
        const response = await fetch("/api/products?sort=topSelling");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const sortedProducts = data
          .filter((product: Product) => product.topSelling > 0)
          .sort((a: Product, b: Product) => b.topSelling - a.topSelling)
          .slice(0, 4); // Limit to only 4 products
        setProducts(sortedProducts);
      } catch (error) {
        console.error("Error fetching top-selling products:", error);
        setProducts([]);
      }
    };

    fetchTopSellingProducts();
  }, []);

  return (
    <section id="top-selling" className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">
            Top-Selling <span className="text-accent">Gaming Gear</span>
          </h2>
          <a href="#" className="text-accent hover:underline">
            See More
          </a>
        </div>{" "}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {Array.isArray(products) && products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} item={product} />
            ))
          ) : (
            <p></p>
          )}
        </div>
      </div>
    </section>
  );
};
