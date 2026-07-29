/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback } from "react";
import AllProductsFilters from "./AllProductsFilters";
import AllProductsItems from "../AllProductsItems";

interface ProductItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  images: Array<{ url: string }>;
  brand?: { name: string };
  category: { name: string };
  averageRating: number;
  topSelling: number;
  createdAt: Date;
  slug: string;
}

interface ClientSideAllProductsPageProps {
  items: ProductItem[];
  uniqueBrands: string[];
  uniqueCategories: string[];
  lowestPrice: number;
  highestPrice: number;
}

export default function ClientSideAllProductsPage({
  items,
  uniqueBrands,
  uniqueCategories,
  lowestPrice,
  highestPrice,
}: ClientSideAllProductsPageProps) {
  const [filteredItems, setFilteredItems] = useState(items);
  // This function will be called by the AllProductsFilters component
  // Using useCallback to prevent it from being recreated on each render
  const handleFiltersChange = useCallback((newFilteredItems: any[]) => {
    setFilteredItems(newFilteredItems);
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <AllProductsFilters
        uniqueBrands={uniqueBrands}
        uniqueCategories={uniqueCategories}
        lowestPrice={lowestPrice}
        highestPrice={highestPrice}
        items={items}
        onFiltersChange={handleFiltersChange}
      />

      <section className="w-full md:w-3/4">
        <div className="mb-4">
          <p className="text-sm text-gray-500">
            Showing {filteredItems.length} of {items.length} products
          </p>
        </div>

        {filteredItems.length > 0 ? (
          <AllProductsItems items={filteredItems} />
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No products match your filters.</p>
          </div>
        )}
      </section>
    </div>
  );
}
