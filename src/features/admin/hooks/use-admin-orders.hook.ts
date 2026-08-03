"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { OrderStatus } from "@prisma/client";
import { toast } from "sonner";
import {
  fetchAdminOrderById,
  fetchAdminOrders,
  updateAdminOrderStatus,
} from "@/features/admin/services/admin.service";

export function useAdminOrders(page: number, pageSize: number) {
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ["admin", "orders", page, pageSize],
    queryFn: () => fetchAdminOrders({ page, pageSize }),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      updateAdminOrderStatus(orderId, status),
    onSuccess: () => invalidate(),
    onError: () => toast.error("Failed to update order status"),
  });

  const fetchDetails = async (orderId: string) => {
    try {
      return await fetchAdminOrderById(orderId);
    } catch {
      toast.error("Failed to fetch order details");
      return null;
    }
  };

  return {
    orders: ordersQuery.data?.orders ?? [],
    totalPages: ordersQuery.data?.totalPages ?? 1,
    isLoading: ordersQuery.isLoading,
    updateOrderStatus: updateStatusMutation.mutate,
    fetchOrderDetails: fetchDetails,
  };
}
