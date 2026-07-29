"use client";

import { StarIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Slider } from "@/shared/components/ui/slider";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useProductFilters } from "@/features/products/hooks/use-product-filters.hook";
import type { ProductListItem } from "@/features/products/types/product.type";

interface ProductFiltersProps {
  uniqueBrands: string[];
  uniqueCategories?: string[];
  lowestPrice: number;
  highestPrice: number;
  contextLabel?: string;
  items: ProductListItem[];
  onFiltersChange: (filteredItems: ProductListItem[]) => void;
}

function StarRating({
  rating,
  onRatingClick,
}: {
  rating: number;
  onRatingClick: (rating: number) => void;
}) {
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
}

export function ProductFilters({
  uniqueBrands,
  uniqueCategories = [],
  lowestPrice,
  highestPrice,
  contextLabel,
  items,
  onFiltersChange,
}: ProductFiltersProps) {
  const showCategoryFilter = uniqueCategories.length > 0;

  const {
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
  } = useProductFilters({
    items,
    lowestPrice,
    highestPrice,
    showCategoryFilter,
    onFiltersChange,
  });

  return (
    <aside className="w-full md:w-1/4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {contextLabel ? `Filters for ${contextLabel}` : "Filters"}
        </h2>
        <Button variant="outline" size="sm" onClick={clearAllFilters}>
          Clear All
        </Button>
      </div>

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

      {showCategoryFilter && (
        <div className="space-y-3">
          <h3 className="font-medium">Category</h3>
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

      <div className="space-y-3">
        <h3 className="font-medium">Availability</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="in-stock"
              checked={inStock}
              onCheckedChange={(checked) => setInStock(checked as boolean)}
            />
            <label htmlFor="in-stock" className="text-sm font-medium leading-none">
              In Stock
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="out-of-stock"
              checked={outOfStock}
              onCheckedChange={(checked) => setOutOfStock(checked as boolean)}
            />
            <label htmlFor="out-of-stock" className="text-sm font-medium leading-none">
              Out of Stock
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-medium">Minimum Rating</h3>
        <StarRating rating={selectedRating} onRatingClick={setSelectedRating} />
      </div>
    </aside>
  );
}
