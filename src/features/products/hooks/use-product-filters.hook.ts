"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { ProductListItem } from "@/features/products/types/product.type";

export interface ProductFiltersState {
  sortBy: string;
  selectedBrands: string[];
  selectedCategory: string;
  priceRange: [number, number];
  inStock: boolean;
  outOfStock: boolean;
  selectedRating: number;
}

interface UseProductFiltersOptions {
  items: ProductListItem[];
  lowestPrice: number;
  highestPrice: number;
  showCategoryFilter?: boolean;
  onFiltersChange: (filteredItems: ProductListItem[]) => void;
}

export function useProductFilters({
  items,
  lowestPrice,
  highestPrice,
  showCategoryFilter = false,
  onFiltersChange,
}: UseProductFiltersOptions) {
  const [sortBy, setSortBy] = useState("newest");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([
    lowestPrice,
    highestPrice,
  ]);
  const [inStock, setInStock] = useState(false);
  const [outOfStock, setOutOfStock] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const applyFilters = useCallback(() => {
    let filtered = [...items];

    if (selectedBrands.length > 0) {
      filtered = filtered.filter((item) =>
        item.brand ? selectedBrands.includes(item.brand.name) : false
      );
    }

    if (showCategoryFilter && selectedCategory !== "all") {
      filtered = filtered.filter(
        (item) => item.category?.name === selectedCategory
      );
    }

    filtered = filtered.filter(
      (item) => item.price >= priceRange[0] && item.price <= priceRange[1]
    );

    if (inStock && !outOfStock) {
      filtered = filtered.filter((item) => item.quantity > 0);
    } else if (outOfStock && !inStock) {
      filtered = filtered.filter((item) => item.quantity === 0);
    }

    if (selectedRating > 0) {
      filtered = filtered.filter(
        (item) => item.averageRating >= selectedRating
      );
    }

    switch (sortBy) {
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "oldest":
        filtered.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case "popular":
        filtered.sort((a, b) => b.topSelling - a.topSelling);
        break;
      default:
        break;
    }

    onFiltersChange(filtered);
  }, [
    items,
    selectedBrands,
    selectedCategory,
    showCategoryFilter,
    priceRange,
    inStock,
    outOfStock,
    selectedRating,
    sortBy,
    onFiltersChange,
  ]);

  const debouncedApplyFilters = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(applyFilters, 300);
  }, [applyFilters]);

  useEffect(() => {
    applyFilters();
  }, [
    selectedBrands,
    selectedCategory,
    inStock,
    outOfStock,
    selectedRating,
    sortBy,
    applyFilters,
  ]);

  useEffect(() => {
    debouncedApplyFilters();
  }, [priceRange, debouncedApplyFilters]);

  const handleBrandChange = (brandName: string, checked: boolean) => {
    if (checked) {
      setSelectedBrands((prev) => [...prev, brandName]);
    } else {
      setSelectedBrands((prev) => prev.filter((brand) => brand !== brandName));
    }
  };

  const clearAllFilters = () => {
    setSortBy("newest");
    setSelectedBrands([]);
    setSelectedCategory("all");
    setPriceRange([lowestPrice, highestPrice]);
    setInStock(false);
    setOutOfStock(false);
    setSelectedRating(0);
  };

  return {
    sortBy,
    setSortBy,
    selectedBrands,
    selectedCategory,
    setSelectedCategory,
    priceRange,
    setPriceRange,
    inStock,
    setInStock,
    outOfStock,
    setOutOfStock,
    selectedRating,
    setSelectedRating,
    handleBrandChange,
    clearAllFilters,
  };
}
