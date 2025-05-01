"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { X } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category?: { name: string };
  brand?: { name: string };
  averageRating: number;
  images: { url: string }[];
  slug: string;
  quantity: number;
  specifications?: {
    [key: string]: string;
  };
}

const ProductCompare = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    // Load compared products from localStorage on mount
    const loadComparedProducts = () => {
      const savedProducts = localStorage.getItem("comparedProducts");
      if (savedProducts) {
        try {
          setProducts(JSON.parse(savedProducts));
        } catch (e) {
          console.error("Error loading compared products:", e);
          localStorage.removeItem("comparedProducts");
        }
      }
    };

    loadComparedProducts();
  }, []);

  useEffect(() => {
    // Save products to localStorage whenever they change
    if (products.length > 0) {
      localStorage.setItem("comparedProducts", JSON.stringify(products));
    }
  }, [products]);

  const removeProduct = (id: string) => {
    const updatedProducts = products.filter((product) => product.id !== id);
    setProducts(updatedProducts);

    if (updatedProducts.length === 0) {
      localStorage.removeItem("comparedProducts");
    }

    toast.success("Product removed from comparison");
  };

  const clearAll = () => {
    setProducts([]);
    localStorage.removeItem("comparedProducts");
    toast.success("Comparison cleared");
  };

  // Function to handle adding to cart
  const handleAddToCart = async (product: Product) => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId: product.id,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add item to cart");
      }

      const data = await response.json();

      if (data.success) {
        toast.success(`${product.name} added to cart`);
      } else {
        toast.error(data.error || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("An error occurred while adding to cart");
    }
  };

  // Navigate to product details
  const navigateToProduct = (slug: string) => {
    router.push(`/product/${slug}`);
  };

  // Get all unique specification keys from all products
  const allSpecKeys = Array.from(
    new Set(
      products.flatMap((product) =>
        product.specifications ? Object.keys(product.specifications) : []
      )
    )
  );

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Product Comparison</h1>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="mb-4">
              You haven't added any products to compare yet.
            </p>
            <Button asChild>
              <Link href="/categories/all">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product Comparison</h1>
        <Button variant="outline" onClick={clearAll}>
          Clear All
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/4">Feature</TableHead>
              {products.map((product) => (
                <TableHead key={product.id} className="text-center">
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white border shadow-sm hover:bg-gray-100"
                        onClick={() => removeProduct(product.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <div className="relative h-24 w-24 mb-2">
                        {product.images && product.images.length > 0 ? (
                          <Image
                            src={product.images[0].url}
                            alt={product.name}
                            fill
                            className="object-contain"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500">No image</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <h3 className="font-medium text-sm truncate max-w-[150px]">
                      {product.name}
                    </h3>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Price</TableCell>
              {products.map((product) => (
                <TableCell key={`${product.id}-price`} className="text-center">
                  <span className="font-semibold">{product.price}€</span>
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Brand</TableCell>
              {products.map((product) => (
                <TableCell key={`${product.id}-brand`} className="text-center">
                  {product.brand?.name || "N/A"}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Category</TableCell>
              {products.map((product) => (
                <TableCell
                  key={`${product.id}-category`}
                  className="text-center"
                >
                  {product.category?.name || "N/A"}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Rating</TableCell>
              {products.map((product) => (
                <TableCell key={`${product.id}-rating`} className="text-center">
                  {product.averageRating?.toFixed(1) || "N/A"} / 5
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Availability</TableCell>
              {products.map((product) => (
                <TableCell key={`${product.id}-stock`} className="text-center">
                  {product.quantity > 0
                    ? `In Stock (${product.quantity})`
                    : "Out of Stock"}
                </TableCell>
              ))}
            </TableRow>

            {allSpecKeys.map((specKey) => (
              <TableRow key={`spec-${specKey}`}>
                <TableCell className="font-medium capitalize">
                  {specKey}
                </TableCell>
                {products.map((product) => (
                  <TableCell
                    key={`${product.id}-${specKey}`}
                    className="text-center"
                  >
                    {product.specifications?.[specKey] || "N/A"}
                  </TableCell>
                ))}
              </TableRow>
            ))}

            <TableRow>
              <TableCell></TableCell>
              {products.map((product) => (
                <TableCell key={`${product.id}-action`} className="text-center">
                  <div className="flex flex-col space-y-2">
                    <Button
                      size="sm"
                      onClick={() => navigateToProduct(product.slug)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-accent text-accent hover:bg-accent hover:text-white"
                      onClick={() => handleAddToCart(product)}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProductCompare;
