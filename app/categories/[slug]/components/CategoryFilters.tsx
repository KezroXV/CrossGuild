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

interface CategoryFiltersProps {
  uniqueBrands: string[];
  lowestPrice: number;
  highestPrice: number;
  items: any[];
  onFiltersChange: (filteredItems: any[]) => void;
}

export default function CategoryFilters({
  uniqueBrands,
  lowestPrice,
  highestPrice,
  items,
  onFiltersChange,
}: CategoryFiltersProps) {
  // Filter states
  const [inStock, setInStock] = useState(false);
  const [outOfStock, setOutOfStock] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    lowestPrice,
    highestPrice,
  ]);
  const [selectedBrand, setSelectedBrand] = useState("all");
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
    } else if (!inStock && outOfStock) {
      result = result.filter((item) => item.quantity === 0);
    }

    // Filter by price range
    result = result.filter(
      (item) => item.price >= priceRange[0] && item.price <= priceRange[1]
    );

    // Filter by brand
    if (selectedBrand && selectedBrand !== "all") {
      result = result.filter((item) => item.brand?.name === selectedBrand);
    }

    // Filter by rating
    if (minRating > 0) {
      result = result.filter((item) => item.averageRating >= minRating);
    }

    // Sort the items
    switch (sortOption) {
      case "price-asc":
        return [...result].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...result].sort((a, b) => b.price - a.price);
      case "top-selling":
        return [...result].sort((a, b) => b.topSelling - a.topSelling);
      case "rating":
        return [...result].sort((a, b) => b.averageRating - a.averageRating);
      case "newest":
      default:
        return [...result].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  }, [
    inStock,
    outOfStock,
    priceRange,
    selectedBrand,
    minRating,
    sortOption,
    items,
  ]);

  // Apply filters ONLY when filter values change, not on every render
  useEffect(() => {
    // Skip the first render to prevent an initial double filter
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    const filteredResult = applyFilters();
    onFiltersChange(filteredResult);
  }, [applyFilters, onFiltersChange]); // Only depend on the memoized function

  // Initial filter application
  useEffect(() => {
    const filteredResult = applyFilters();
    onFiltersChange(filteredResult);
    // This effect runs once after the initial render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setInStock(false);
    setOutOfStock(false);
    setPriceRange([lowestPrice, highestPrice]);
    setSelectedBrand("all");
    setMinRating(0);
    setSortOption("newest");
  }, [lowestPrice, highestPrice]);

  return (
    <aside className="w-full md:w-1/4 bg-background p-6 rounded-lg shadow-sm">
      <div className="mb-6 border-b pb-4">
        <h2 className="text-lg font-semibold mb-3 text-foreground">
          Availability
        </h2>
        <div className="flex items-center mt-2">
          <Checkbox
            id="available"
            checked={inStock}
            onCheckedChange={(checked) => setInStock(!!checked)}
          />
          <label htmlFor="available" className="ml-2 text-sm text-foreground">
            In stock
          </label>
        </div>
        <div className="flex items-center mt-2">
          <Checkbox
            id="out-of-stock"
            checked={outOfStock}
            onCheckedChange={(checked) => setOutOfStock(!!checked)}
          />
          <label
            htmlFor="out-of-stock"
            className="ml-2 text-sm text-foreground"
          >
            Out of stock
          </label>
        </div>
      </div>

      <div className="mb-6 border-b pb-4">
        <h2 className="text-lg font-semibold mb-3 text-foreground">Price</h2>
        <div className="flex justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            ${priceRange[0]}
          </span>
          <span className="text-sm text-muted-foreground">
            ${priceRange[1]}
          </span>
        </div>
        <div className="px-1">
          <Slider
            value={priceRange}
            min={lowestPrice}
            max={highestPrice}
            step={1}
            onValueChange={setPriceRange}
          />
        </div>
      </div>

      {uniqueBrands.length > 0 && (
        <div className="mb-6 border-b pb-4">
          <h2 className="text-lg font-semibold mb-3 text-foreground">Brands</h2>
          <Select value={selectedBrand} onValueChange={setSelectedBrand}>
            <SelectTrigger>
              <SelectValue placeholder="All brands" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All brands</SelectItem>
              {uniqueBrands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="mb-6 border-b pb-4">
        <h2 className="text-lg font-semibold mb-3 text-foreground">Rating</h2>
        {[5, 4, 3, 2, 1].map((rating) => (
          <div key={rating} className="flex items-center mt-2">
            <Checkbox
              id={`rating-${rating}`}
              checked={minRating === rating}
              onCheckedChange={(checked) => {
                if (checked) {
                  setMinRating(rating);
                } else if (minRating === rating) {
                  setMinRating(0);
                }
              }}
            />
            <label
              htmlFor={`rating-${rating}`}
              className="ml-2 flex items-center text-foreground"
            >
              {Array(rating)
                .fill(0)
                .map((_, i) => (
                  <StarIcon
                    key={i}
                    className="h-4 w-4 fill-current text-yellow-400"
                  />
                ))}
              {Array(5 - rating)
                .fill(0)
                .map((_, i) => (
                  <StarIcon key={i} className="h-4 w-4 text-muted-foreground" />
                ))}
              <span className="ml-1 text-sm">& Up</span>
            </label>
          </div>
        ))}
      </div>

      <div className="mb-6 border-b pb-4">
        <h2 className="text-lg font-semibold mb-3 text-foreground">Sort by</h2>
        <Select value={sortOption} onValueChange={setSortOption}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="top-selling">Best Selling</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mb-6">
        <Button className="w-full" onClick={clearFilters}>
          Clear filters
        </Button>
      </div>
    </aside>
  );
}
