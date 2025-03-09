"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  images: { url: string }[];
}

export const TopSellingGamingGear = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchTopSellingProducts = async () => {
      try {
        const response = await fetch("/api/products?topSelling=true");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching top-selling products:", error);
      }
    };

    fetchTopSellingProducts();
  }, []);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">
            Top-Selling <span className="text-purple-500">Gaming Gear</span>
          </h2>
          <a href="#" className="text-accent hover:underline">
            See More
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.length === 0 ? (
            <p>No top-selling products available.</p>
          ) : (
            products.map((product) => (
              <Card key={product.id} className="text-center">
                <CardHeader className="pb-0">
                  <div className="h-48  flex items-center justify-center">
                    <Image
                      src={product.images[0]?.url || "/path/to/default.jpg"}
                      alt={product.name}
                      width={200}
                      height={200}
                      className="object-contain"
                    />
                  </div>
                  <CardTitle className="text-xl text-left font-semibold">
                    {product.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 pl-6 text-left">
                  <div className="flex justify-left items-center my-2">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span
                        key={i}
                        className={`text-xl ${
                          i < product.rating
                            ? "text-secondary"
                            : "text-gray-300"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-lg font-bold">{product.price}€</p>
                </CardContent>
                <CardFooter className="mt-4 flex justify-center gap-2">
                  <Button className="bg-accent px-4 py-2 text-sm shadow-md">
                    Buy Now
                  </Button>
                  <Button
                    variant="outline"
                    className="px-4 py-2 border-primary border-2 text-sm shadow-md"
                  >
                    Learn More
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
