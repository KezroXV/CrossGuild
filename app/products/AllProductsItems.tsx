"use client";
import React, { useState } from "react";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// Types
interface ProductItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  images: Array<{ url: string }>;
  brand?: {
    name: string;
  };
  slug: string;
  averageRating: number;
  category: {
    name: string;
  };
}

interface AllProductsItemsProps {
  items: ProductItem[];
}

export default function AllProductsItems({ items }: AllProductsItemsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Slightly more items per page for the all products view

  // Filter items based on search term
  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder="Search products, brands, categories..."
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
          <p className="text-lg text-gray-600">No products found</p>
          {searchTerm && (
            <p className="text-sm text-gray-500 mt-2">
              Try adjusting your search or filters
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {" "}
            {currentItems.map((item) => (
              <ProductCard
                key={item.id}
                item={{
                  ...item,
                  brand: item.brand || { name: "Unknown" }, // Provide default value for brand
                }}
              />
            ))}
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              {/* Show page numbers with ellipsis for large page counts */}
              {totalPages <= 7 ? (
                // Show all pages if 7 or fewer
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
                // Show with ellipsis for more than 7 pages
                <>
                  {/* First page */}
                  <Button
                    variant={currentPage === 1 ? "default" : "outline"}
                    onClick={() => handlePageChange(1)}
                  >
                    1
                  </Button>

                  {/* Ellipsis or pages before current */}
                  {currentPage > 3 && <span className="px-2">...</span>}

                  {/* Pages around current page */}
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

                  {/* Ellipsis or pages after current */}
                  {currentPage < totalPages - 2 && (
                    <span className="px-2">...</span>
                  )}

                  {/* Last page */}
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

          {/* Results summary */}
          <div className="text-center text-sm text-gray-500">
            Showing {indexOfFirstItem + 1}-
            {Math.min(indexOfLastItem, filteredItems.length)} of{" "}
            {filteredItems.length} products
          </div>
        </>
      )}
    </div>
  );
}
