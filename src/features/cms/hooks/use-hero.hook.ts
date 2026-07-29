"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchHeroContent,
  updateHeroContent,
} from "@/features/cms/services/cms.service";

export function useHero() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["cms", "hero"],
    queryFn: fetchHeroContent,
  });

  const mutation = useMutation({
    mutationFn: updateHeroContent,
    onSuccess: () => {
      toast.success("Home hero content updated successfully");
      queryClient.invalidateQueries({ queryKey: ["cms", "hero"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update hero content: ${error.message}`);
    },
  });

  return {
    heroContent: query.data,
    isLoading: query.isLoading,
    isSubmitting: mutation.isPending,
    updateHero: mutation.mutateAsync,
  };
}
