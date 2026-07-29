"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  deleteAdminUser,
  fetchAdminRoles,
  fetchAdminUsers,
  updateAdminUser,
} from "@/features/admin/services/admin.service";

export function useAdminUsers() {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ["admin", "users"],
    queryFn: fetchAdminUsers,
  });

  const rolesQuery = useQuery({
    queryKey: ["admin", "roles"],
    queryFn: fetchAdminRoles,
    retry: false,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "users"] });

  const updateMutation = useMutation({
    mutationFn: updateAdminUser,
    onSuccess: () => invalidate(),
    onError: () => toast.error("Failed to update user"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => {
      toast.success("User deleted successfully");
      invalidate();
    },
    onError: () => toast.error("Failed to delete user"),
  });

  return {
    users: usersQuery.data?.users ?? [],
    roles: rolesQuery.data?.roles ?? [],
    isLoading: usersQuery.isLoading,
    updateUser: updateMutation.mutateAsync,
    deleteUser: deleteMutation.mutateAsync,
  };
}
