/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback } from "react";
import ItemsCategories from "../itemsCategories";
import CategoryFilters from "./CategoryFilters";

interface ClientSideCategoryPageProps {
  items: any[];
  categoryName: string;
  uniqueBrands: string[];
  lowestPrice: number;
  highestPrice: number;
}

export default function ClientSideCategoryPage({
  items,

  uniqueBrands,
  lowestPrice,
  highestPrice,
}: ClientSideCategoryPageProps) {
  const [filteredItems, setFilteredItems] = useState(items);

  // This function will be called by the CategoryFilters component
  // Using useCallback to prevent it from being recreated on each render
  const handleFiltersChange = useCallback((newFilteredItems: any[]) => {
    setFilteredItems(newFilteredItems);
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <CategoryFilters
        uniqueBrands={uniqueBrands}
        lowestPrice={lowestPrice}
        highestPrice={highestPrice}
        items={items}
        onFiltersChange={handleFiltersChange}
      />

      <section className="w-full md:w-3/4">
        <div className="mb-4">
          <p className="text-sm text-gray-500">
            Showing {filteredItems.length} of {items.length} items
          </p>
        </div>

        {filteredItems.length > 0 ? (
          <ItemsCategories items={filteredItems} />
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No items match your filters.</p>
          </div>
        )}
      </section>
    </div>
  );
}
