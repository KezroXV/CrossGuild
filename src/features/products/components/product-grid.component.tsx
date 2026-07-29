"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import ProductCard from "@/shared/components/ProductCard";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import type { ProductListItem } from "@/features/products/types/product.type";

interface ProductGridProps {
  items: ProductListItem[];
  variant?: "category" | "all-products";
}

export function ProductGrid({ items, variant = "category" }: ProductGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = variant === "all-products" ? 12 : 9;

  const filteredItems = items.filter((item) => {
    const term = searchTerm.toLowerCase();
    const matchesName = item.name.toLowerCase().includes(term);
    const matchesBrand = item.brand?.name.toLowerCase().includes(term);
    const matchesCategory = item.category?.name.toLowerCase().includes(term);

    if (variant === "all-products") {
      return matchesName || matchesBrand || matchesCategory;
    }

    return matchesName;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const placeholder =
    variant === "all-products"
      ? "Search products, brands, categories..."
      : "Search items...";

  const emptyMessage =
    variant === "all-products" ? "No products found" : "No items found";

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="pl-10"
        />
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg text-gray-600">{emptyMessage}</p>
          {searchTerm && variant === "all-products" && (
            <p className="text-sm text-gray-500 mt-2">
              Try adjusting your search or filters
            </p>
          )}
        </div>
      ) : (
        <>
          <div
            className={
              variant === "all-products"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6"
                : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            }
          >
            {currentItems.map((item) => (
              <ProductCard
                key={item.id}
                item={{
                  ...item,
                  brand: item.brand || { name: "Unknown" },
                }}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              {totalPages <= 7 ? (
                [...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i}
                    variant={i + 1 === currentPage ? "default" : "outline"}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))
              ) : (
                <>
                  <Button
                    variant={currentPage === 1 ? "default" : "outline"}
                    onClick={() => handlePageChange(1)}
                  >
                    1
                  </Button>

                  {currentPage > 3 && <span className="px-2">...</span>}

                  {[...Array(Math.min(5, totalPages - 2))]
                    .map(
                      (_, i) =>
                        Math.max(2, Math.min(currentPage - 1, totalPages - 4)) +
                        i
                    )
                    .filter((page) => page > 1 && page < totalPages)
                    .map((page) => (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    ))}

                  {currentPage < totalPages - 2 && (
                    <span className="px-2">...</span>
                  )}

                  {totalPages > 1 && (
                    <Button
                      variant={
                        currentPage === totalPages ? "default" : "outline"
                      }
                      onClick={() => handlePageChange(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  )}
                </>
              )}

              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}

          {variant === "all-products" && (
            <div className="text-center text-sm text-gray-500">
              Showing {indexOfFirstItem + 1}-
              {Math.min(indexOfLastItem, filteredItems.length)} of{" "}
              {filteredItems.length} products
            </div>
          )}
        </>
      )}
    </div>
  );
}
