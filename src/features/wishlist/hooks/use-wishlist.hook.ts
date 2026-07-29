"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  addWishlistItem,
  addWishlistItemToCart,
  checkWishlistItem,
  fetchWishlist,
  fetchWishlistCount,
  removeWishlistItem,
} from "@/features/wishlist/services/wishlist.service";

export const wishlistKeys = {
  all: ["wishlist"] as const,
  items: () => [...wishlistKeys.all, "items"] as const,
  count: () => [...wishlistKeys.all, "count"] as const,
  check: (itemId: string) => [...wishlistKeys.all, "check", itemId] as const,
};

function invalidateWishlistQueries(
  queryClient: ReturnType<typeof useQueryClient>
) {
  queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
}

export function useWishlistCount() {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;

  const countQuery = useQuery({
    queryKey: wishlistKeys.count(),
    queryFn: fetchWishlistCount,
    enabled: isAuthenticated,
    refetchInterval: 30_000,
  });

  return {
    count: isAuthenticated ? (countQuery.data?.count ?? 0) : 0,
    isLoading: countQuery.isLoading,
  };
}

export function useWishlistItem(itemId: string, itemName?: string) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const isAuthenticated = !!session?.user;

  const checkQuery = useQuery({
    queryKey: wishlistKeys.check(itemId),
    queryFn: () => checkWishlistItem(itemId),
    enabled: isAuthenticated && !!itemId,
  });

  const toggleMutation = useMutation({
    mutationFn: async (wasInWishlist: boolean) => {
      if (wasInWishlist) {
        return removeWishlistItem(itemId);
      }

      return addWishlistItem(itemId);
    },
    onSuccess: (_data, wasInWishlist) => {
      invalidateWishlistQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: wishlistKeys.check(itemId) });

      const label = itemName ?? "Item";

      toast.success(
        wasInWishlist
          ? `${label} removed from your wishlist`
          : `${label} added to your wishlist`
      );
    },
    onError: (_error, wasInWishlist) => {
      toast.error(
        wasInWishlist
          ? "Failed to remove from wishlist"
          : "Failed to add to wishlist"
      );
    },
  });

  return {
    isInWishlist: checkQuery.data?.inWishlist ?? false,
    isLoading: checkQuery.isLoading,
    isToggling: toggleMutation.isPending,
    toggle: () =>
      toggleMutation.mutate(checkQuery.data?.inWishlist ?? false),
    isAuthenticated,
  };
}

export function useWishlist() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const isAuthenticated = !!session?.user;

  const itemsQuery = useQuery({
    queryKey: wishlistKeys.items(),
    queryFn: fetchWishlist,
    enabled: isAuthenticated,
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => removeWishlistItem(itemId),
    onSuccess: () => {
      invalidateWishlistQueries(queryClient);
      toast.success("Item removed from wishlist");
    },
    onError: () => {
      toast.error("Failed to remove item");
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: ({
      itemId,
      quantity = 1,
    }: {
      itemId: string;
      quantity?: number;
    }) => addWishlistItemToCart(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Item added to cart");
    },
    onError: () => {
      toast.error("Failed to add to cart");
    },
  });

  const removingItemId = removeItemMutation.isPending
    ? removeItemMutation.variables ?? null
    : null;

  const addingToCartItemId = addToCartMutation.isPending
    ? addToCartMutation.variables?.itemId ?? null
    : null;

  const actionLoadingItemId = removingItemId ?? addingToCartItemId;

  return {
    items: itemsQuery.data?.items ?? [],
    isLoading: itemsQuery.isLoading,
    isAuthenticated,
    removeItem: removeItemMutation.mutate,
    addToCart: addToCartMutation.mutate,
    actionLoadingItemId,
    refetch: itemsQuery.refetch,
  };
}
