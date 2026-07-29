"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchContactInfo,
  updateContactInfo,
} from "@/features/cms/services/cms.service";
import type { ContactInfo } from "@/features/cms/types/cms.type";

export function useContactInfo() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["cms", "contact-info"],
    queryFn: fetchContactInfo,
  });

  const mutation = useMutation({
    mutationFn: updateContactInfo,
    onSuccess: () => {
      toast.success("Contact information updated successfully");
      queryClient.invalidateQueries({ queryKey: ["cms", "contact-info"] });
    },
    onError: () =>
      toast.error("An error occurred while updating contact information"),
  });

  return {
    contactInfo: query.data as ContactInfo | undefined,
    isLoading: query.isLoading,
    isSubmitting: mutation.isPending,
    updateContactInfo: mutation.mutateAsync,
  };
}
