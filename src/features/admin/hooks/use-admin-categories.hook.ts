"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createAdminCategory,
  deleteAdminCategory,
  fetchAdminCategories,
  updateAdminCategory,
} from "@/features/admin/services/admin.service";

export function useAdminCategories() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: fetchAdminCategories,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });

  const createMutation = useMutation({
    mutationFn: createAdminCategory,
    onSuccess: () => {
      toast.success("Category created successfully");
      invalidate();
    },
    onError: () => toast.error("Failed to create category"),
  });

  const updateMutation = useMutation({
    mutationFn: updateAdminCategory,
    onSuccess: () => {
      toast.success("Category updated successfully");
      invalidate();
    },
    onError: () => toast.error("Failed to update category"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminCategory,
    onSuccess: () => {
      toast.success("Category deleted successfully");
      invalidate();
    },
    onError: () => toast.error("Failed to delete category"),
  });

  return {
    categories: query.data?.categories ?? [],
    isLoading: query.isLoading,
    createCategory: createMutation.mutateAsync,
    updateCategory: updateMutation.mutateAsync,
    deleteCategory: deleteMutation.mutateAsync,
  };
}
