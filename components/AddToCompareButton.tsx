/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SplitSquareVertical } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AddToCompareButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    images: { url: string }[];
    brand?: { name: string };
    category?: { name: string };
    averageRating: number;
    slug: string;
    quantity: number;
    description: string;
    specifications?: {
      [key: string]: string;
    };
  };
  className?: string;
}

const AddToCompareButton: React.FC<AddToCompareButtonProps> = ({
  product,
  className,
}) => {
  const [isInCompare, setIsInCompare] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Make sure we have full product data with brand and category
  const prepareProductData = async () => {
    // If the product already has complete data, use it directly
    if (product.brand?.name && product.category?.name) {
      return product;
    }

    // Otherwise fetch complete product data
    try {
      const response = await fetch(`/api/products/${product.id}`);
      if (response.ok) {
        const data = await response.json();
        return {
          ...product,
          brand: data.brand,
          category: data.category,
        };
      }
    } catch (error) {
      console.error("Failed to fetch complete product data:", error);
    }

    return product;
  };

  // Check if product is already in compare list
  useEffect(() => {
    const checkCompareList = () => {
      const compareList = localStorage.getItem("comparedProducts");
      if (compareList) {
        try {
          const products = JSON.parse(compareList);
          setIsInCompare(products.some((p: any) => p.id === product.id));
        } catch (e) {
          console.error("Error parsing compare list:", e);
        }
      }
    };

    checkCompareList();
  }, [product.id]);

  const handleAddToCompare = async () => {
    setIsLoading(true);

    try {
      const compareList = localStorage.getItem("comparedProducts");
      let products = [];

      if (compareList) {
        products = JSON.parse(compareList);

        // Check if already in list
        if (products.some((p: any) => p.id === product.id)) {
          // Remove from compare
          const updatedProducts = products.filter(
            (p: any) => p.id !== product.id
          );
          localStorage.setItem(
            "comparedProducts",
            JSON.stringify(updatedProducts)
          );
          setIsInCompare(false);
          toast.success(`${product.name} removed from comparison`);
          return;
        }

        // Limit to 4 products
        if (products.length >= 4) {
          toast.error(
            "You can compare up to 4 products. Please remove a product first."
          );
          setIsLoading(false);
          return;
        }
      }

      // Add to compare with complete data
      const completeProduct = await prepareProductData();
      const updatedProducts = [...products, completeProduct];

      localStorage.setItem("comparedProducts", JSON.stringify(updatedProducts));
      setIsInCompare(true);
      toast.success(`${product.name} added to comparison`);
    } catch (e) {
      console.error("Error updating compare list:", e);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const viewComparison = () => {
    router.push("/compare");
  };

  return (
    <div className={className || "flex flex-col items-center"}>
      <Button
        variant="outline"
        size="sm"
        className={`flex items-center gap-1 ${isInCompare ? "bg-primary/10" : ""}`}
        onClick={handleAddToCompare}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full"></span>
        ) : (
          <SplitSquareVertical className="w-4 h-4" />
        )}
        {isInCompare ? "Remove Compare" : "Add to Compare"}
      </Button>

      {isInCompare && (
        <Button
          variant="link"
          size="sm"
          className="text-xs underline mt-1 h-auto p-0"
          onClick={viewComparison}
        >
          View comparison
        </Button>
      )}
    </div>
  );
};

export default AddToCompareButton;
