"use client";

import { useState, useCallback } from "react";
import { ProductFilters } from "@/features/products/components/product-filters.component";
import { ProductGrid } from "@/features/products/components/product-grid.component";
import type { ProductListItem } from "@/features/products/types/product.type";

interface CategoryProductGridProps {
  items: ProductListItem[];
  contextLabel: string;
  uniqueBrands: string[];
  uniqueCategories?: string[];
  lowestPrice: number;
  highestPrice: number;
  variant?: "category" | "all-products";
  itemLabel?: string;
}

export function CategoryProductGrid({
  items,
  contextLabel,
  uniqueBrands,
  uniqueCategories,
  lowestPrice,
  highestPrice,
  variant = "category",
  itemLabel = "items",
}: CategoryProductGridProps) {
  const [filteredItems, setFilteredItems] = useState(items);

  const handleFiltersChange = useCallback((newFilteredItems: ProductListItem[]) => {
    setFilteredItems(newFilteredItems);
  }, []);

  const countLabel =
    variant === "all-products"
      ? `Showing ${filteredItems.length} of ${items.length} products`
      : `Showing ${filteredItems.length} of ${items.length} ${itemLabel} in ${contextLabel}`;

  const emptyMessage =
    variant === "all-products"
      ? "No products match your filters."
      : "No items match your filters.";

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <ProductFilters
        uniqueBrands={uniqueBrands}
        uniqueCategories={uniqueCategories}
        lowestPrice={lowestPrice}
        highestPrice={highestPrice}
        contextLabel={variant === "category" ? contextLabel : undefined}
        items={items}
        onFiltersChange={handleFiltersChange}
      />

      <section className="w-full md:w-3/4">
        <div className="mb-4">
          <p className="text-sm text-gray-500">{countLabel}</p>
        </div>

        {filteredItems.length > 0 ? (
          <ProductGrid items={filteredItems} variant={variant} />
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">{emptyMessage}</p>
            {variant === "category" && (
              <p className="text-sm text-gray-400 mt-2">
                Try adjusting your search criteria or clear all filters.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
