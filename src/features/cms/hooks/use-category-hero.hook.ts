"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchCategoryHeroContent,
  updateCategoryHeroContent,
} from "@/features/cms/services/cms.service";

export function useCategoryHero() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["cms", "category-hero"],
    queryFn: fetchCategoryHeroContent,
  });

  const mutation = useMutation({
    mutationFn: updateCategoryHeroContent,
    onSuccess: () => {
      toast.success("Category hero content updated successfully");
      queryClient.invalidateQueries({ queryKey: ["cms", "category-hero"] });
    },
    onError: () => toast.error("Failed to update category hero content"),
  });

  return {
    categoryHeroContent: query.data,
    isLoading: query.isLoading,
    isSubmitting: mutation.isPending,
    updateCategoryHero: mutation.mutateAsync,
  };
}
