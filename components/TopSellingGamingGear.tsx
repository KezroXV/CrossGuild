"use client";
import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";
import Link from "next/link";

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

const ProductSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-muted rounded-lg h-64 mb-4"></div>
    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
    <div className="h-6 bg-muted rounded w-1/4"></div>
  </div>
);

export const TopSellingGamingGear = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopSellingProducts();
  }, []);

  return (
    <section id="top-selling" className="py-20 bg-gradient-to-b from-transparent via-purple-50/20 to-transparent dark:via-purple-950/10">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Top-Selling <span className="text-accent">Gaming Gear</span>
            </h2>
            <p className="text-muted-foreground mt-2">
              Découvrez nos produits les plus populaires
            </p>
          </div>
          <Link
            href="/products"
            className="text-accent hover:text-accent/80 font-semibold flex items-center gap-2 group transition-all duration-300"
          >
            Voir Plus
            <span className="group-hover:translate-x-1 transition-transform duration-300">
              →
            </span>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {isLoading ? (
            <>
              {[...Array(4)].map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <ProductSkeleton />
                </motion.div>
              ))}
            </>
          ) : Array.isArray(products) && products.length > 0 ? (
            products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProductCard item={product} />
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-12"
            >
              <p className="text-muted-foreground text-lg">
                Aucun produit disponible pour le moment
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};
