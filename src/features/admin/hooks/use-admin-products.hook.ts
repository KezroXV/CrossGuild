"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createAdminProduct,
  deleteAdminProduct,
  fetchAdminCategories,
  fetchAdminProducts,
  fetchBrands,
  updateAdminProduct,
  uploadImages,
} from "@/features/admin/services/admin.service";
import type { AdminProductFormInput } from "@/features/admin/types/admin.type";

export function useAdminProducts(page: number, pageSize: number) {
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ["admin", "products", page, pageSize],
    queryFn: () => fetchAdminProducts({ page, pageSize }),
  });

  const categoriesQuery = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: fetchAdminCategories,
  });

  const brandsQuery = useQuery({
    queryKey: ["admin", "brands"],
    queryFn: fetchBrands,
  });

  const invalidateProducts = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "products"] });

  const createMutation = useMutation({
    mutationFn: (input: AdminProductFormInput) => createAdminProduct(input),
    onSuccess: () => {
      toast.success("Product created successfully");
      invalidateProducts();
    },
    onError: () => toast.error("Failed to create product"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: AdminProductFormInput }) =>
      updateAdminProduct(id, input),
    onSuccess: () => {
      toast.success("Product updated successfully");
      invalidateProducts();
    },
    onError: () => toast.error("Failed to update product"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminProduct,
    onSuccess: () => {
      toast.success("Product deleted successfully");
      invalidateProducts();
    },
    onError: () => toast.error("Failed to delete product"),
  });

  const uploadMutation = useMutation({
    mutationFn: uploadImages,
    onSuccess: () => toast.success("Images uploaded successfully"),
    onError: () => toast.error("Failed to upload images"),
  });

  return {
    products: productsQuery.data?.products ?? [],
    totalPages: productsQuery.data?.totalPages ?? 1,
    categories: categoriesQuery.data?.categories ?? [],
    brands: brandsQuery.data ?? [],
    isLoading: productsQuery.isLoading,
    isUploading: uploadMutation.isPending,
    createProduct: createMutation.mutateAsync,
    updateProduct: updateMutation.mutateAsync,
    deleteProduct: deleteMutation.mutateAsync,
    uploadImages: uploadMutation.mutateAsync,
  };
}
