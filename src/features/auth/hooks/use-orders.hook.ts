"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  cancelUserOrder,
  fetchUserOrders,
} from "@/features/auth/services/profile.service";
import type { UserOrder } from "@/features/auth/types/profile.type";

export const orderKeys = {
  all: ["user-orders"] as const,
  list: (page: number) => [...orderKeys.all, page] as const,
};

export function useOrders(initialPage = 1) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [selectedOrder, setSelectedOrder] = useState<UserOrder | null>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [selectedOrderForCancel, setSelectedOrderForCancel] =
    useState<UserOrder | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const query = useQuery({
    queryKey: orderKeys.list(currentPage),
    queryFn: () => fetchUserOrders(currentPage),
    enabled: !!session?.user,
  });

  const cancelMutation = useMutation({
    mutationFn: (orderId: string) => cancelUserOrder(orderId),
    onSuccess: (_data, orderId) => {
      toast.success("Order cancelled successfully");
      queryClient.invalidateQueries({ queryKey: orderKeys.all });

      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: "CANCELLED" });
      }

      setIsCancelDialogOpen(false);
      setSelectedOrderForCancel(null);
    },
    onError: () => {
      toast.error("Failed to cancel the order");
      setIsCancelDialogOpen(false);
      setSelectedOrderForCancel(null);
    },
  });

  const openOrderDetails = (order: UserOrder) => {
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
  };

  const openCancelDialog = (order: UserOrder) => {
    setSelectedOrderForCancel(order);
    setIsCancelDialogOpen(true);
  };

  const handleCancelOrder = () => {
    if (!selectedOrderForCancel) return;
    cancelMutation.mutate(selectedOrderForCancel.id);
  };

  const fetchPage = (page: number) => {
    setCurrentPage(page);
  };

  return {
    orders: query.data?.orders ?? [],
    currentPage: query.data?.currentPage ?? currentPage,
    totalPages: query.data?.totalPages ?? 1,
    isLoading: query.isLoading,
    selectedOrder,
    isOrderDetailsOpen,
    setIsOrderDetailsOpen,
    selectedOrderForCancel,
    isCancelDialogOpen,
    setIsCancelDialogOpen,
    openOrderDetails,
    openCancelDialog,
    handleCancelOrder,
    fetchPage,
    isCancelling: cancelMutation.isPending,
  };
}

export function isOrderCancellable(status: string) {
  const normalized = status.toUpperCase();
  return normalized === "PENDING" || normalized === "PROCESSING";
}

export function formatOrderAmount(value: number | undefined | null): string {
  return value !== undefined && value !== null ? value.toFixed(2) : "0.00";
}

export function getOrderStatusLabel(status: string): string {
  const normalized = status.toUpperCase();
  switch (normalized) {
    case "PENDING":
      return "Pending";
    case "PROCESSING":
      return "Processing";
    case "SHIPPED":
      return "Shipped";
    case "DELIVERED":
      return "Delivered";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
}
