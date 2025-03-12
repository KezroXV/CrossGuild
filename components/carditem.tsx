import React from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  price: number;
  images: { url: string }[];
  rating?: number;
  brand?: { name: string };
  slug: string;
}

interface CardItemProps {
  product: Product;
  variant?: "topSelling" | "category" | "search";
  showRating?: boolean;
  animate?: boolean;
}

const slideFromBottom = {
  hidden: { opacity: 0, y: 100 },
  visible: { opacity: 1, y: 0 },
};

const CardItem = ({
  product,
  variant = "category",
  showRating = false,
  animate = true,
}: CardItemProps) => {
  const CardWrapper = animate ? motion.div : "div";
  const motionProps = animate
    ? {
        initial: "hidden",
        whileInView: "visible",
        viewport: { once: true },
        variants: slideFromBottom,
        transition: { duration: 0.5 },
      }
    : {};

  const renderContent = () => (
    <Card className="text-center border-4 shadow-md">
      <CardHeader className="pb-0">
        <div className="relative w-full h-[200px] flex items-center justify-center p-4">
          <Image
            src={product.images[0]?.url || "/images/placeholder.jpg"}
            alt={product.name}
            fill
            className="object-contain p-2"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        </div>
        <CardTitle className="text-xl text-left font-semibold truncate">
          {product.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 pl-6 text-left">
        {showRating && product.rating && (
          <div className="flex justify-left items-center my-2">
            {Array.from({ length: 5 }, (_, i) => (
              <span
                key={i}
                className={`text-xl ${
                  i < product.rating ? "text-secondary" : "text-gray-300"
                }`}
              >
                ★
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-col gap-2">
          <p className="text-lg font-bold">${product.price.toFixed(2)}</p>
          {product.brand && (
            <p className="text-sm text-gray-500">{product.brand.name}</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="mt-4 flex justify-center gap-2">
        <Button className="bg-accent px-4 py-2 text-sm shadow-md">
          {variant === "topSelling" ? "Buy Now" : "Add to Cart"}
        </Button>
        <Button
          variant="outline"
          className="px-4 py-2 border-primary border-2 text-sm shadow-md"
        >
          {variant === "search" ? "View Details" : "Learn More"}
        </Button>
      </CardFooter>
    </Card>
  );

  return <CardWrapper {...motionProps}>{renderContent()}</CardWrapper>;
};

export default CardItem;
