"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createOffer,
  deleteOffer,
  fetchOffers,
  updateOffer,
} from "@/features/cms/services/cms.service";

export function useOffers() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["cms", "offers"],
    queryFn: fetchOffers,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["cms", "offers"] });

  const createMutation = useMutation({
    mutationFn: createOffer,
    onSuccess: () => {
      toast.success("Offer added successfully");
      invalidate();
    },
    onError: () => toast.error("Failed to add offer"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      updateOffer(id, formData),
    onSuccess: () => {
      toast.success("Offer updated successfully");
      invalidate();
    },
    onError: () => toast.error("Failed to update offer"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOffer,
    onSuccess: () => {
      toast.success("Offer deleted successfully");
      invalidate();
    },
    onError: () => toast.error("Failed to delete offer"),
  });

  return {
    offers: query.data ?? [],
    isLoading: query.isLoading,
    isSubmitting:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
    createOffer: createMutation.mutateAsync,
    updateOffer: updateMutation.mutateAsync,
    deleteOffer: deleteMutation.mutateAsync,
  };
}
