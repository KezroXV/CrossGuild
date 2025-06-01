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

interface AllProductsFiltersProps {
  uniqueBrands: string[];
  uniqueCategories: string[];
  lowestPrice: number;
  highestPrice: number;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    averageRating: number;
    topSelling: number;
    createdAt: Date;
    brand?: { name: string };
    category: { name: string } | null;
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
      category: { name: string } | null;
    }[]
  ) => void;
}

export default function AllProductsFilters({
  uniqueBrands,
  uniqueCategories,
  lowestPrice,
  highestPrice,
  items,
  onFiltersChange,
}: AllProductsFiltersProps) {
  // Filter states
  const [inStock, setInStock] = useState(false);
  const [outOfStock, setOutOfStock] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    lowestPrice,
    highestPrice,
  ]);
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [sortOption, setSortOption] = useState("newest");

  // Use a ref to track if this is the first render
  const firstRender = useRef(true);

  // Memoize the filter function to prevent it being recreated on each render
  const applyFilters = useCallback(() => {
    let result = [...items];

    // Filter by availability
    if (inStock && !outOfStock) {
      result = result.filter((item) => item.quantity > 0);
    } else if (outOfStock && !inStock) {
      result = result.filter((item) => item.quantity === 0);
    }

    // Filter by price range
    result = result.filter(
      (item) => item.price >= priceRange[0] && item.price <= priceRange[1]
    );

    // Filter by brand
    if (selectedBrand !== "all") {
      result = result.filter((item) => item.brand?.name === selectedBrand);
    } // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter(
        (item) => item.category?.name === selectedCategory
      );
    }

    // Filter by rating
    if (minRating > 0) {
      result = result.filter((item) => item.averageRating >= minRating);
    }

    // Sort results
    switch (sortOption) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case "popular":
        result.sort((a, b) => b.topSelling - a.topSelling);
        break;
      case "newest":
      default:
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    return result;
  }, [
    items,
    inStock,
    outOfStock,
    priceRange,
    selectedBrand,
    selectedCategory,
    minRating,
    sortOption,
  ]);

  // Apply filters whenever filter states change
  useEffect(() => {
    // Skip applying filters on the first render
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    const filtered = applyFilters();
    onFiltersChange(filtered);
  }, [
    applyFilters,
    onFiltersChange,
    inStock,
    outOfStock,
    priceRange,
    selectedBrand,
    selectedCategory,
    minRating,
    sortOption,
  ]);

  const resetFilters = () => {
    setInStock(false);
    setOutOfStock(false);
    setPriceRange([lowestPrice, highestPrice]);
    setSelectedBrand("all");
    setSelectedCategory("all");
    setMinRating(0);
    setSortOption("newest");
  };

  const StarRating = ({
    rating,
    onClick,
  }: {
    rating: number;
    onClick: (rating: number) => void;
  }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            size={16}
            className={`cursor-pointer ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
            onClick={() => onClick(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <aside className="w-full md:w-1/4 space-y-6">
      {/* Sort Options */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Sort By</h3>
        <Select value={sortOption} onValueChange={setSortOption}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stock Availability */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Availability</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            {" "}
            <Checkbox
              id="inStock"
              checked={inStock}
              onCheckedChange={(checked) => setInStock(checked === true)}
            />
            <label htmlFor="inStock" className="text-sm cursor-pointer">
              In Stock
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="outOfStock"
              checked={outOfStock}
              onCheckedChange={(checked) => setOutOfStock(checked === true)}
            />
            <label htmlFor="outOfStock" className="text-sm cursor-pointer">
              Out of Stock
            </label>
          </div>
        </div>
      </div>

      {/* Price Range */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Price Range</h3>
        <div className="space-y-4">
          {" "}
          <Slider
            value={priceRange}
            onValueChange={(value) => setPriceRange([value[0], value[1]])}
            max={highestPrice}
            min={lowestPrice}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>€{priceRange[0]}</span>
            <span>€{priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Brand Filter */}
      {uniqueBrands.length > 0 && (
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3">Brand</h3>
          <Select value={selectedBrand} onValueChange={setSelectedBrand}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {uniqueBrands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Category Filter */}
      {uniqueCategories.length > 0 && (
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3">Category</h3>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {uniqueCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Rating Filter */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Minimum Rating</h3>
        <div className="space-y-2">
          <StarRating rating={minRating} onClick={setMinRating} />
          <p className="text-xs text-gray-500">
            {minRating === 0
              ? "Any rating"
              : `${minRating} star${minRating > 1 ? "s" : ""} & up`}
          </p>
        </div>
      </div>

      {/* Reset Filters */}
      <Button variant="outline" onClick={resetFilters} className="w-full">
        Reset Filters
      </Button>
    </aside>
  );
}
