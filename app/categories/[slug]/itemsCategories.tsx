"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CategoryItem {
  id: string;
  name: string;
  price: number;
  images: { url: string }[];
  brand?: { name: string };
  slug: string;
  rating?: number;
}

interface ItemsCategoriesProps {
  items: CategoryItem[];
}

const slideFromBottom = {
  hidden: { opacity: 0, y: 100 },
  visible: { opacity: 1, y: 0 },
};

const ItemsCategories = ({ items }: ItemsCategoriesProps) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          Aucun produit disponible dans cette catégorie.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {items.map((item) => (
        <motion.div
          key={item.id}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={slideFromBottom}
          transition={{ duration: 0.5 }}
        >
          <Card className="text-center border-4 shadow-md">
            <CardHeader className="pb-0">
              <div className="relative w-full h-[200px] flex items-center justify-center p-4">
                <Image
                  src={item.images[0]?.url || "/path/to/default.jpg"}
                  alt={item.name}
                  fill
                  className="object-contain p-2"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              </div>
              <CardTitle className="text-xl text-left font-semibold truncate">
                {item.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pl-6 text-left">
              <div className="flex justify-left items-center my-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    className={`text-xl ${
                      i < (item.rating || 0)
                        ? "text-secondary"
                        : "text-gray-300"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <p className="text-lg font-bold">{item.price}€</p>
            </CardContent>
            <CardFooter className="mt-4 flex justify-center gap-2">
              <Button className="bg-accent px-4 py-2 text-sm shadow-md">
                Buy Now
              </Button>
              <Button
                variant="outline"
                className="px-4 py-2 border-primary border-2 hover:text-white text-sm shadow-md"
              >
                Learn More
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default ItemsCategories;
