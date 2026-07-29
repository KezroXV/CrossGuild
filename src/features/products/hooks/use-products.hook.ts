"use client";

import { useCallback, useState } from "react";
import {
  fetchPublishedProducts,
  fetchRelatedProducts,
  searchProducts,
} from "@/features/products/services/product.service";
import type { ProductListItem } from "@/features/products/types/product.type";

export function useProducts() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async (sort?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const products = await fetchPublishedProducts(sort);
      return products;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load products";
      setError(message);
      return [] as ProductListItem[];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadRelatedProducts = useCallback(
    async (categoryId: string, excludeId: string, limit = 4) => {
      setIsLoading(true);
      setError(null);

      try {
        return await fetchRelatedProducts(categoryId, excludeId, limit);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load related products";
        setError(message);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const search = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);

    try {
      return await searchProducts(query);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to search products";
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    loadProducts,
    loadRelatedProducts,
    search,
  };
}
