/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "./ui/table";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { Trash2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  images: { url: string }[];
  description?: string;
}

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const router = useRouter();

  const fetchWishlist = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/wishlist");
      const data = await response.json();
      setWishlistItems(data.items || []);
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
      toast.error("Failed to load your wishlist");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemoveItem = async (itemId: string) => {
    setActionLoading(itemId);
    try {
      const response = await fetch(`/api/wishlist?itemId=${itemId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        fetchWishlist();
        toast.success("Item removed from wishlist");
      } else {
        toast.error(data.error || "Failed to remove item");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("An error occurred while removing the item");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddToCart = async (itemId: string) => {
    setActionLoading(itemId);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId,
          quantity: 1,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Item added to cart");
      } else {
        toast.error(data.error || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("An error occurred while adding to cart");
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Wishlist</h1>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg mb-4">Your wishlist is empty</p>
          <Button
            onClick={() => router.push("/")}
            className="bg-accent text-white"
          >
            Continue Shopping
          </Button>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-accent font-bold">Product</TableHead>
                <TableHead className="text-accent font-bold">Price</TableHead>
                <TableHead className="text-accent font-bold">Status</TableHead>
                <TableHead className="text-accent font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wishlistItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <img
                        src={item.images[0]?.url || "/placeholder.png"}
                        alt={item.name}
                        className="w-16 h-16 object-cover mr-4 rounded"
                      />
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{item.price.toFixed(2)}€</TableCell>
                  <TableCell>
                    {item.quantity > 0 ? (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        In Stock
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                        Out of Stock
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center border-accent hover:bg-accent hover:text-white"
                        onClick={() => handleAddToCart(item.id)}
                        disabled={
                          actionLoading === item.id || item.quantity <= 0
                        }
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-100"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={actionLoading === item.id}
                      >
                        {actionLoading === item.id ? (
                          <span className="animate-spin">...</span>
                        ) : (
                          <Trash2 className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-6">
            <Button
              variant="outline"
              className="border-2 border-primary bg-white text-black hover:bg-primary"
              onClick={() => router.push("/")}
            >
              Continue Shopping
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Wishlist;
