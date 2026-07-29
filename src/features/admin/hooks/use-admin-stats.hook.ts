"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAdminStats } from "@/features/admin/services/admin.service";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: fetchAdminStats,
  });
}
