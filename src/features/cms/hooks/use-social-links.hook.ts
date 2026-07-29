"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchSocialLinks,
  updateSocialLinks,
} from "@/features/cms/services/cms.service";

export function useSocialLinks() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["cms", "social-links"],
    queryFn: fetchSocialLinks,
  });

  const mutation = useMutation({
    mutationFn: updateSocialLinks,
    onSuccess: () => {
      toast.success("Social media links updated successfully");
      queryClient.invalidateQueries({ queryKey: ["cms", "social-links"] });
    },
    onError: () => toast.error("Failed to update social media links"),
  });

  return {
    socialLinks: query.data,
    isLoading: query.isLoading,
    isSubmitting: mutation.isPending,
    updateSocialLinks: mutation.mutateAsync,
  };
}
