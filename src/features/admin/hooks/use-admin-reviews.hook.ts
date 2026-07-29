"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createAdminReview,
  deleteAdminReview,
  fetchAdminReviews,
  updateAdminReview,
} from "@/features/admin/services/admin.service";
import type {
  AdminReview,
  AdminReviewFormInput,
} from "@/features/admin/types/admin.type";

const emptyForm: AdminReviewFormInput = {
  content: "",
  rating: 0,
  userId: "",
  itemId: "",
};

export function useAdminReviews() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState("10");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState<AdminReview | null>(null);
  const [formData, setFormData] = useState<AdminReviewFormInput>(emptyForm);

  const reviewsQuery = useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: fetchAdminReviews,
  });

  const pageSizeNum = parseInt(pageSize, 10);

  const filteredReviews = useMemo(() => {
    const reviews = reviewsQuery.data?.reviews ?? [];
    if (!search.trim()) return reviews;

    const term = search.toLowerCase();
    return reviews.filter(
      (review) =>
        review.content.toLowerCase().includes(term) ||
        review.user.name?.toLowerCase().includes(term) ||
        review.item.name.toLowerCase().includes(term)
    );
  }, [reviewsQuery.data?.reviews, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredReviews.length / pageSizeNum)
  );

  const paginatedReviews = useMemo(
    () =>
      filteredReviews.slice(
        (currentPage - 1) * pageSizeNum,
        currentPage * pageSizeNum
      ),
    [filteredReviews, currentPage, pageSizeNum]
  );

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminReview,
    onSuccess: () => {
      toast.success("Review deleted successfully");
      invalidate();
    },
    onError: () => toast.error("Failed to delete review"),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (currentReview) {
        return updateAdminReview(currentReview.id, formData);
      }
      return createAdminReview(formData);
    },
    onSuccess: () => {
      toast.success(
        `Review ${currentReview ? "updated" : "created"} successfully`
      );
      setIsDialogOpen(false);
      invalidate();
    },
    onError: () =>
      toast.error(`Failed to ${currentReview ? "update" : "create"} review`),
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(value);
    setCurrentPage(1);
  };

  const openCreateDialog = () => {
    setCurrentReview(null);
    setFormData(emptyForm);
    setIsDialogOpen(true);
  };

  const openEditDialog = (review: AdminReview) => {
    setCurrentReview(review);
    setFormData({
      content: review.content,
      rating: review.rating,
      userId: review.userId,
      itemId: review.itemId,
    });
    setIsDialogOpen(true);
  };

  return {
    reviews: paginatedReviews,
    isLoading: reviewsQuery.isLoading,
    search,
    onSearchChange: handleSearchChange,
    currentPage,
    totalPages,
    pageSize,
    onPageSizeChange: handlePageSizeChange,
    onPreviousPage: () => setCurrentPage((p) => Math.max(p - 1, 1)),
    onNextPage: () => setCurrentPage((p) => Math.min(p + 1, totalPages)),
    deleteReview: deleteMutation.mutateAsync,
    isDialogOpen,
    setIsDialogOpen,
    currentReview,
    formData,
    setFormData,
    openCreateDialog,
    openEditDialog,
    submitReview: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
}
