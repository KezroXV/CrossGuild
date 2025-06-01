"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StarIcon } from "lucide-react";

interface NewCategoryFiltersProps {
  uniqueBrands: string[];
  lowestPrice: number;
  highestPrice: number;
  categoryName: string;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    averageRating: number;
    topSelling: number;
    createdAt: Date;
    brand?: { name: string };
    brandId?: string;
    isPublished: boolean;
    slug: string;
    images: Array<{ url: string }>;
  }[];
  onFiltersChange: (
    filteredItems: {
      id: string;
      name: string;
      price: number;
      quantity: number;
      averageRating: number;
      topSelling: number;
      createdAt: Date;
      brand?: { name: string };
      brandId?: string;
      isPublished: boolean;
      slug: string;
      images: Array<{ url: string }>;
    }[]
  ) => void;
}

export default function NewCategoryFilters({
  uniqueBrands,
  lowestPrice,
  highestPrice,
  categoryName,
  items,
  onFiltersChange,
}: NewCategoryFiltersProps) {
  // Filter states
  const [sortBy, setSortBy] = useState<string>("newest");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    lowestPrice,
    highestPrice,
  ]);
  const [inStock, setInStock] = useState<boolean>(false);
  const [outOfStock, setOutOfStock] = useState<boolean>(false);
  const [selectedRating, setSelectedRating] = useState<number>(0);

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const applyFilters = useCallback(() => {
    let filtered = [...items];

    // Brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter((item) =>
        item.brand ? selectedBrands.includes(item.brand.name) : false
      );
    }

    // Price range filter
    filtered = filtered.filter(
      (item) => item.price >= priceRange[0] && item.price <= priceRange[1]
    );

    // Stock filter
    if (inStock && !outOfStock) {
      filtered = filtered.filter((item) => item.quantity > 0);
    } else if (outOfStock && !inStock) {
      filtered = filtered.filter((item) => item.quantity === 0);
    }

    // Rating filter
    if (selectedRating > 0) {
      filtered = filtered.filter(
        (item) => item.averageRating >= selectedRating
      );
    }

    // Sort
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
    priceRange,
    inStock,
    outOfStock,
    selectedRating,
    sortBy,
    onFiltersChange,
  ]);

  // Debounced apply filters for price range
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
    setPriceRange([lowestPrice, highestPrice]);
    setInStock(false);
    setOutOfStock(false);
    setSelectedRating(0);
  };

  const StarRating = ({
    rating,
    onRatingClick,
  }: {
    rating: number;
    onRatingClick: (rating: number) => void;
  }) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`h-4 w-4 cursor-pointer ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
            onClick={() => onRatingClick(star)}
          />
        ))}
        {rating > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRatingClick(0)}
            className="text-xs p-1 h-auto"
          >
            Clear
          </Button>
        )}
      </div>
    );
  };

  return (
    <aside className="w-full md:w-1/4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters for {categoryName}</h2>
        <Button variant="outline" size="sm" onClick={clearAllFilters}>
          Clear All
        </Button>
      </div>

      {/* Sort By */}
      <div className="space-y-3">
        <h3 className="font-medium">Sort By</h3>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Select sorting" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Brands */}
      {uniqueBrands.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium">Brands</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {uniqueBrands.map((brand) => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand}`}
                  checked={selectedBrands.includes(brand)}
                  onCheckedChange={(checked) =>
                    handleBrandChange(brand, checked as boolean)
                  }
                />
                <label
                  htmlFor={`brand-${brand}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {brand}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div className="space-y-3">
        <h3 className="font-medium">Price Range</h3>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            max={highestPrice}
            min={lowestPrice}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Stock Status */}
      <div className="space-y-3">
        <h3 className="font-medium">Availability</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="in-stock"
              checked={inStock}
              onCheckedChange={(checked) => setInStock(checked as boolean)}
            />
            <label
              htmlFor="in-stock"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              In Stock
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="out-of-stock"
              checked={outOfStock}
              onCheckedChange={(checked) => setOutOfStock(checked as boolean)}
            />
            <label
              htmlFor="out-of-stock"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Out of Stock
            </label>
          </div>
        </div>
      </div>

      {/* Star Rating */}
      <div className="space-y-3">
        <h3 className="font-medium">Minimum Rating</h3>
        <StarRating rating={selectedRating} onRatingClick={setSelectedRating} />
      </div>
    </aside>
  );
}
