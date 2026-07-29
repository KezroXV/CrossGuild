"use client";

import { Star } from "lucide-react";
import type { ProductDetailItem } from "@/features/products/types/product.type";

interface ProductInfoProps {
  product: ProductDetailItem;
  averageRating: number;
}

export default function ProductInfo({
  product,
  averageRating,
}: ProductInfoProps) {
  return (
    <div className="relative z-10">
      <nav className="text-sm text-muted-foreground mb-6 bg-muted/20 px-4 py-2 rounded-full inline-block backdrop-blur-sm border border-accent/10">
        <span className="hover:text-accent transition-colors cursor-pointer">
          Home
        </span>
        <span className="mx-2">›</span>
        <span className="hover:text-accent transition-colors cursor-pointer">
          {product.category?.name || "Category"}
        </span>
        <span className="mx-2">›</span>
        <span className="text-foreground font-medium">{product.name}</span>
      </nav>

      <h1 className="text-4xl font-black bg-gradient-to-r from-foreground via-foreground to-accent bg-clip-text text-transparent leading-tight mb-4">
        {product.name}
      </h1>

      <div className="flex items-center mt-4 mb-6">
        {product.reviews && product.reviews.length > 0 && (
          <div className="flex items-center bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 px-4 py-2 rounded-full border border-yellow-200 dark:border-yellow-800">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={`h-5 w-5 transition-all duration-200 ${
                  index < Math.round(averageRating)
                    ? "text-yellow-500 fill-yellow-500 drop-shadow-sm"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="ml-3 text-sm font-bold text-yellow-700 dark:text-yellow-300">
              {averageRating.toFixed(1)}
            </span>
            <span className="ml-2 text-sm text-muted-foreground">
              ({product.reviews.length}{" "}
              {product.reviews.length === 1 ? "review" : "reviews"})
            </span>
          </div>
        )}
      </div>

      {product.brand && (
        <div className="mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
            <span className="w-2 h-2 bg-primary rounded-full mr-2" />
            {product.brand.name}
          </span>
        </div>
      )}

      <div className="mb-6">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-primary/20 rounded-2xl blur-lg" />
          <p className="relative text-4xl font-black bg-gradient-to-r from-accent via-accent to-primary bg-clip-text text-transparent px-6 py-3">
            {product.price} €
          </p>
        </div>
      </div>

      <div className="mb-8">
        <div className="bg-muted/30 backdrop-blur-sm rounded-2xl p-6 border border-accent/10">
          <h3 className="text-lg font-semibold mb-3 text-foreground">
            Description
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${product.quantity > 0 ? "bg-green-500" : "bg-red-500"}`}
            />
            <span className="text-sm font-medium text-muted-foreground">
              Stock:
            </span>
          </div>
          <span
            className={`font-bold px-3 py-1 rounded-full text-sm ${
              product.quantity > 0
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            {product.quantity > 0
              ? `${product.quantity} available`
              : "Out of stock"}
          </span>
        </div>
      </div>
    </div>
  );
}
