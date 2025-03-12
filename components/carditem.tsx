"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { motion } from "framer-motion";

interface Product {
  id: string;
  name: string;
  price: number;
  images: { url: string }[];
  brand?: { name: string };
  slug: string;
}

interface CardItemProps {
  product: Product;
  variant?: "category" | "default";
  showRating?: boolean;
  animate?: boolean;
}

const CardItem = ({
  product,
  variant = "default",
  showRating = false,
  animate = false,
}: CardItemProps) => {
  const card = (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-0">
        <div className="relative w-full h-[200px]">
          <Image
            src={product.images[0]?.url || "/images/placeholder-product.png"}
            alt={product.name}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        </div>
        <CardTitle className="text-lg mt-2 truncate">{product.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {product.brand?.name && (
          <p className="text-sm text-gray-500">{product.brand.name}</p>
        )}
        <p className="text-lg font-bold mt-2">{product.price}€</p>
      </CardContent>
      <CardFooter className="mt-auto">
        <Button className="w-full">View Details</Button>
      </CardFooter>
    </Card>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {card}
      </motion.div>
    );
  }

  return card;
};

export default CardItem;
