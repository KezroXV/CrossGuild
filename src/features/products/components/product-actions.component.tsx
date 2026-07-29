"use client";

import { Button } from "@/shared/components/ui/button";
import { ShoppingCart, Heart } from "lucide-react";
import AddToCompareButton from "@/shared/components/AddToCompareButton";
import type { ProductDetailItem } from "@/features/products/types/product.type";

interface ProductActionsProps {
  product: ProductDetailItem;
  averageRating: number;
  isAddingToCart: boolean;
  isAddingToWishlist: boolean;
  isInWishlist: boolean;
  isPending: boolean;
  onBuyNow: () => void;
  onAddToCart: () => void;
  onToggleWishlist: () => void;
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-spin -ml-1 mr-3 h-5 w-5 ${className ?? ""}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export default function ProductActions({
  product,
  averageRating,
  isAddingToCart,
  isAddingToWishlist,
  isInWishlist,
  isPending,
  onBuyNow,
  onAddToCart,
  onToggleWishlist,
}: ProductActionsProps) {
  const isDisabled = product.quantity === 0 || isAddingToCart || isPending;

  return (
    <div className="mt-8 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          className="flex-1 bg-primary text-primary-foreground font-bold py-4 px-8 rounded-lg hover:bg-primary/90 transition-colors"
          disabled={isDisabled}
          onClick={onBuyNow}
        >
          <div className="flex items-center justify-center">
            {isAddingToCart || isPending ? (
              <span className="flex items-center">
                <LoadingSpinner className="text-white" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center font-bold text-lg">
                🚀 Buy Now
              </span>
            )}
          </div>
        </Button>

        <Button
          variant="outline"
          className="flex-1 font-bold py-4 px-8 rounded-lg"
          disabled={isDisabled}
          onClick={onAddToCart}
        >
          <div className="flex items-center justify-center">
            {isAddingToCart || isPending ? (
              <span className="flex items-center">
                <LoadingSpinner />
                Adding...
              </span>
            ) : (
              <div className="flex items-center font-bold text-lg">
                <ShoppingCart className="mr-3 h-5 w-5" />
                Add to Cart
              </div>
            )}
          </div>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <Button
          variant="outline"
          className="flex-1 font-bold py-4 px-8 rounded-lg"
          disabled={isAddingToWishlist}
          onClick={onToggleWishlist}
        >
          <Heart
            className={`mr-3 h-5 w-5 ${
              isInWishlist ? "text-primary fill-primary" : ""
            }`}
            fill={isInWishlist ? "currentColor" : "none"}
          />
          {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        </Button>

        <AddToCompareButton
          product={{
            id: product.id,
            name: product.name,
            price: product.price,
            images: product.images,
            brand: product.brand,
            category: product.category,
            averageRating,
            slug: product.id,
            quantity: product.quantity,
            description: product.description,
          }}
          className="flex-1"
        />
      </div>
    </div>
  );
}
