"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  ShoppingCart,
  Search,
  ChevronDown,
  ChevronUp,
  Heart,
  Filter,
  ArrowUpDown,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/components/ui/pagination";
import type { WishlistItem } from "@/features/wishlist/types/wishlist.type";

interface WishlistGridProps {
  items: WishlistItem[];
  actionLoadingItemId: string | null;
  onRemoveItem: (itemId: string) => void;
  onAddToCart: (itemId: string) => void;
}

export function WishlistGrid({
  items,
  actionLoadingItemId,
  onRemoveItem,
  onAddToCart,
}: WishlistGridProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"name" | "price">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleSort = (field: "name" | "price") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleImageError = (itemId: string) => {
    setImageErrors((prev) => ({
      ...prev,
      [itemId]: true,
    }));
  };

  const filteredItems = items
    .filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortField === "name") {
        return sortDirection === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }

      return sortDirection === "asc" ? a.price - b.price : b.price - a.price;
    });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center py-12 bg-muted/50 rounded-lg dark:bg-muted/10 border dark:border-border"
      >
        <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-xl mb-4">Your wishlist is empty</p>
        <p className="text-muted-foreground mb-6">
          Add items to your wishlist to save them for later
        </p>
        <Button
          onClick={() => router.push("/")}
          className="bg-accent text-accent-foreground hover:bg-accent/90"
          size="lg"
        >
          Continue Shopping
        </Button>
      </motion.div>
    );
  }

  return (
    <>
      <div className="bg-card rounded-lg shadow-sm p-4 mb-6 border dark:border-border dark:shadow-none">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
          <div className="relative w-full md:w-auto flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search your wishlist..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select
              value={sortField}
              onValueChange={(value) => handleSort(value as "name" | "price")}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price">Price</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setSortDirection(sortDirection === "asc" ? "desc" : "asc")
              }
            >
              {sortDirection === "asc" ? <ChevronUp /> : <ChevronDown />}
            </Button>
          </div>
        </div>

        {filteredItems.length > 0 ? (
          <>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 dark:bg-muted/10 hover:bg-muted/40 dark:hover:bg-muted/20">
                    <TableHead
                      className="text-accent font-bold hover:text-accent/80 cursor-pointer transition-colors"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center">
                        Product
                        {sortField === "name" && (
                          <ArrowUpDown size={16} className="ml-1" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-accent font-bold hover:text-accent/80 cursor-pointer transition-colors"
                      onClick={() => handleSort("price")}
                    >
                      <div className="flex items-center">
                        Price
                        {sortField === "price" && (
                          <ArrowUpDown size={16} className="ml-1" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-accent font-bold">
                      Status
                    </TableHead>
                    <TableHead className="text-accent font-bold">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {currentItems.map((item) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="group hover:bg-muted/20 dark:hover:bg-muted/10"
                        layout
                      >
                        <TableCell>
                          <div className="flex items-center">
                            <div className="relative overflow-hidden rounded-md">
                              {imageErrors[item.id] || !item.images[0]?.url ? (
                                <div className="w-20 h-20 flex items-center justify-center bg-muted/30 dark:bg-muted/10 rounded-md mr-4">
                                  <ImageIcon className="w-10 h-10 text-muted-foreground" />
                                </div>
                              ) : (
                                <motion.img
                                  src={item.images[0]?.url}
                                  alt={item.name}
                                  className="w-20 h-20 object-cover mr-4 rounded-md"
                                  onError={() => handleImageError(item.id)}
                                  initial={{ opacity: 0.6 }}
                                  animate={{ opacity: 1 }}
                                  whileHover={{ scale: 1.05 }}
                                  transition={{ duration: 0.2 }}
                                />
                              )}
                              {!imageErrors[item.id] &&
                                item.images.length > 1 && (
                                  <Badge
                                    variant="secondary"
                                    className="absolute -top-2 -right-2 z-10 dark:bg-accent/30 dark:text-foreground"
                                  >
                                    +{item.images.length - 1}
                                  </Badge>
                                )}
                            </div>
                            <div className="max-w-xs">
                              <h3 className="font-medium text-lg hover:text-accent cursor-pointer transition-colors">
                                {item.name}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-lg font-medium">
                          {item.price.toFixed(2)} €
                        </TableCell>
                        <TableCell>
                          {item.quantity > 0 ? (
                            <Badge
                              variant="outline"
                              className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-900 dark:hover:bg-green-900/50"
                            >
                              In Stock ({item.quantity})
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-900 dark:hover:bg-red-900/50"
                            >
                              Out of Stock
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center border-accent text-accent hover:bg-accent hover:text-accent-foreground dark:border-accent dark:text-accent dark:hover:bg-accent dark:hover:text-accent-foreground transition-all"
                              onClick={() => onAddToCart(item.id)}
                              disabled={
                                actionLoadingItemId === item.id ||
                                item.quantity <= 0
                              }
                            >
                              {actionLoadingItemId === item.id ? (
                                <div className="animate-spin h-4 w-4 border-2 border-accent border-t-transparent rounded-full mr-2" />
                              ) : (
                                <ShoppingCart className="h-4 w-4 mr-2" />
                              )}
                              Add to Cart
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-white hover:bg-red-500 dark:text-red-400 dark:hover:bg-red-900 transition-colors"
                              onClick={() => onRemoveItem(item.id)}
                              disabled={actionLoadingItemId === item.id}
                            >
                              {actionLoadingItemId === item.id ? (
                                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                              ) : (
                                <Trash2 className="h-5 w-5" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        currentPage > 1 && paginate(currentPage - 1)
                      }
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    if (
                      i === 0 ||
                      i === totalPages - 1 ||
                      (i + 1 >= currentPage - 1 && i + 1 <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={i}>
                          <PaginationLink
                            isActive={currentPage === i + 1}
                            onClick={() => paginate(i + 1)}
                            className="cursor-pointer"
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }

                    if (
                      (i === 1 && currentPage > 3) ||
                      (i === totalPages - 2 && currentPage < totalPages - 2)
                    ) {
                      return (
                        <PaginationItem key={i}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }

                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        currentPage < totalPages && paginate(currentPage + 1)
                      }
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        ) : (
          <div className="text-center py-8 dark:bg-muted/5 rounded-lg">
            <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-lg font-medium">No items match your search</p>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filter to find what you&apos;re
              looking for
            </p>
            <Button variant="outline" onClick={() => setSearchQuery("")}>
              Clear search
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
        <Button
          variant="outline"
          className="border-2 border-primary text-primary hover:bg-primary/10 dark:border-primary dark:text-primary dark:hover:bg-primary/20 transition-colors w-full sm:w-auto"
          onClick={() => router.push("/")}
        >
          Continue Shopping
        </Button>

        {filteredItems.length > 0 && (
          <Button
            variant="default"
            className="bg-accent text-accent-foreground hover:bg-accent/90 transition-colors w-full sm:w-auto dark:bg-accent dark:text-accent-foreground dark:hover:bg-accent/90"
            onClick={() => {
              toast.success("All items have been added to your cart");
            }}
          >
            Add All to Cart
          </Button>
        )}
      </div>
    </>
  );
}
