"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createBrand,
  deleteBrand,
  fetchBrands,
  updateBrand,
} from "@/features/admin/services/admin.service";

export function useAdminBrands() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin", "brands"],
    queryFn: fetchBrands,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "brands"] });

  const createMutation = useMutation({
    mutationFn: createBrand,
    onSuccess: () => {
      toast.success("Brand created successfully");
      invalidate();
    },
    onError: () => toast.error("Failed to create brand"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      updateBrand(id, formData),
    onSuccess: () => {
      toast.success("Brand updated successfully");
      invalidate();
    },
    onError: () => toast.error("Failed to update brand"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBrand,
    onSuccess: () => {
      toast.success("Brand deleted successfully");
      invalidate();
    },
    onError: () => toast.error("Failed to delete brand"),
  });

  return {
    brands: query.data ?? [],
    isLoading: query.isLoading,
    createBrand: createMutation.mutateAsync,
    updateBrand: updateMutation.mutateAsync,
    deleteBrand: deleteMutation.mutateAsync,
  };
}
