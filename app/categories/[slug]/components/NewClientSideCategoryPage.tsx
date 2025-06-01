"use client";

import { useState, useCallback } from "react";
import ItemsCategories from "../itemsCategories";
import NewCategoryFilters from "./NewCategoryFilters";

interface NewClientSideCategoryPageProps {
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
  categoryName: string;
  uniqueBrands: string[];
  lowestPrice: number;
  highestPrice: number;
}

export default function NewClientSideCategoryPage({
  items,
  categoryName,
  uniqueBrands,
  lowestPrice,
  highestPrice,
}: NewClientSideCategoryPageProps) {
  const [filteredItems, setFilteredItems] = useState(items);

  // This function will be called by the NewCategoryFilters component
  const handleFiltersChange = useCallback((newFilteredItems: typeof items) => {
    setFilteredItems(newFilteredItems);
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <NewCategoryFilters
        uniqueBrands={uniqueBrands}
        lowestPrice={lowestPrice}
        highestPrice={highestPrice}
        categoryName={categoryName}
        items={items}
        onFiltersChange={handleFiltersChange}
      />

      <section className="w-full md:w-3/4">
        <div className="mb-4">
          <p className="text-sm text-gray-500">
            Showing {filteredItems.length} of {items.length} items in{" "}
            {categoryName}
          </p>
        </div>

        {filteredItems.length > 0 ? (
          <ItemsCategories items={filteredItems} />
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No items match your filters.</p>
            <p className="text-sm text-gray-400 mt-2">
              Try adjusting your search criteria or clear all filters.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
