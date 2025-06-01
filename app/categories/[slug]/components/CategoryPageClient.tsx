/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ItemsCategories from "../itemsCategories";
import CategoryFilters from "./CategoryFilters";

interface CategoryItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  images: Array<{ url: string }>;
  brand?: {
    name: string;
  };
  slug: string;
  isPublished: boolean;
  averageRating: number;
  topSelling: number;
  createdAt: Date;
}

interface CategoryPageClientProps {
  categoryName: string;
  description?: string;
  items: CategoryItem[];
}

export function CategoryPageClient({
  categoryName,
  description,
  items,
}: CategoryPageClientProps) {
  const searchParams = useSearchParams();

  // Filter states derived from URL
  const inStock = searchParams?.get("inStock") === "true";
  const outOfStock = searchParams?.get("outOfStock") === "true";
  const minPrice = searchParams?.get("minPrice")
    ? parseFloat(searchParams.get("minPrice") as string)
    : Math.min(...items.map((item) => item.price));
  const maxPrice = searchParams?.get("maxPrice")
    ? parseFloat(searchParams.get("maxPrice") as string)
    : Math.max(...items.map((item) => item.price));
  const selectedBrand = searchParams?.get("brand") || "";
  const minRating = searchParams?.get("rating")
    ? parseFloat(searchParams.get("rating") as string)
    : 0;
  const sortOption = searchParams?.get("sort") || "newest";

  // Get unique brands
  const uniqueBrands = Array.from(
    new Set(
      items
        .map((item) => item.brand?.name)
        .filter((brand) => brand !== undefined)
    )
  ) as string[];

  // Price range
  const priceRange = {
    min: Math.min(...items.map((item) => item.price)),
    max: Math.max(...items.map((item) => item.price)),
  };

  // Apply filters to items
  const [filteredItems, setFilteredItems] = useState<CategoryItem[]>(items);

  // Update filtered items when URL params change
  useEffect(() => {
    let result = [...items];

    // Filter by availability
    if (inStock && !outOfStock) {
      result = result.filter((item) => item.quantity > 0);
    } else if (!inStock && outOfStock) {
      result = result.filter((item) => item.quantity === 0);
    }

    // Filter by price range
    result = result.filter(
      (item) => item.price >= minPrice && item.price <= maxPrice
    );

    // Filter by brand
    if (selectedBrand) {
      result = result.filter((item) => item.brand?.name === selectedBrand);
    }

    // Filter by rating
    if (minRating > 0) {
      result = result.filter((item) => item.averageRating >= minRating);
    }

    // Sort the items
    switch (sortOption) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "top-selling":
        result.sort((a, b) => b.topSelling - a.topSelling);
        break;
      case "rating":
        result.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case "newest":
      default:
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    setFilteredItems(result);
  }, [
    items,
    inStock,
    outOfStock,
    minPrice,
    maxPrice,
    selectedBrand,
    minRating,
    sortOption,
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{categoryName}</h1>
        {description && <p className="text-gray-600 mt-2">{description}</p>}
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-1/4 bg-white p-6 rounded-lg shadow-sm">
          <CategoryFilters
            uniqueBrands={[]}
            lowestPrice={0}
            highestPrice={0}
            items={[]}
            onFiltersChange={function (filteredItems: any[]): void {
              throw new Error("Function not implemented.");
            }}
          />
        </aside>

        <section className="w-full md:w-3/4">
          <div className="mb-4 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Showing {filteredItems.length} of {items.length} items
            </p>

            <div className="hidden lg:block">
              <Select
                value={sortOption}
                onValueChange={(value) => {
                  const url = new URL(window.location.href);
                  url.searchParams.set("sort", value);
                  window.location.href = url.toString();
                }}
              >
                <SelectTrigger className="w-[180px]">
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
          </div>

          {filteredItems.length > 0 ? (
            <ItemsCategories items={filteredItems} />
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No items match your filters.</p>
              <Button
                variant="link"
                className="mt-2"
                onClick={() => {
                  window.location.href = window.location.pathname;
                }}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
