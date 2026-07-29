"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  addToCartItem,
  createOrder,
  fetchCart,
  fetchCartCount,
  removeCartItem,
  updateCartItemQuantity,
} from "@/features/cart/services/cart.service";
import type { DeliveryInfo } from "@/features/cart/validations/cart.schema";

export const cartKeys = {
  all: ["cart"] as const,
  items: () => [...cartKeys.all, "items"] as const,
  count: () => [...cartKeys.all, "count"] as const,
};

function invalidateCartQueries(
  queryClient: ReturnType<typeof useQueryClient>
) {
  queryClient.invalidateQueries({ queryKey: cartKeys.all });
}

export function useCartCount() {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;

  const countQuery = useQuery({
    queryKey: cartKeys.count(),
    queryFn: fetchCartCount,
    enabled: isAuthenticated,
    refetchInterval: 30_000,
  });

  return {
    count: isAuthenticated ? (countQuery.data?.count ?? 0) : 0,
    isLoading: countQuery.isLoading,
  };
}

export function useCart() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const isAuthenticated = !!session?.user;

  const itemsQuery = useQuery({
    queryKey: cartKeys.items(),
    queryFn: fetchCart,
    enabled: isAuthenticated,
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({
      itemId,
      quantity,
    }: {
      itemId: string;
      quantity: number;
    }) => updateCartItemQuantity(itemId, quantity),
    onSuccess: () => {
      invalidateCartQueries(queryClient);
      toast.success("Quantity updated");
    },
    onError: () => {
      toast.error("Failed to update quantity");
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => removeCartItem(itemId),
    onSuccess: () => {
      invalidateCartQueries(queryClient);
      toast.success("Item removed from cart");
    },
    onError: () => {
      toast.error("Failed to remove item");
    },
  });

  const addItemMutation = useMutation({
    mutationFn: ({
      itemId,
      quantity = 1,
    }: {
      itemId: string;
      quantity?: number;
    }) => addToCartItem(itemId, quantity),
    onSuccess: () => {
      invalidateCartQueries(queryClient);
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: (deliveryInfo: DeliveryInfo) => createOrder(deliveryInfo),
  });

  const items = itemsQuery.data?.items ?? [];
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const updatingItemId = updateQuantityMutation.isPending
    ? updateQuantityMutation.variables?.itemId ?? null
    : null;

  const removingItemId = removeItemMutation.isPending
    ? removeItemMutation.variables ?? null
    : null;

  return {
    items,
    subtotal,
    isLoading: itemsQuery.isLoading,
    isAuthenticated,
    updateQuantity: updateQuantityMutation.mutate,
    removeItem: removeItemMutation.mutate,
    addItem: addItemMutation.mutateAsync,
    checkout: checkoutMutation.mutateAsync,
    isUpdating: updatingItemId,
    isRemoving: removingItemId,
    isCheckingOut: checkoutMutation.isPending,
    refetch: itemsQuery.refetch,
  };
}
