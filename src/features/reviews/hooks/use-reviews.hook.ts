"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  deleteReview,
  fetchFeaturedReviews,
  fetchProductReviews,
  submitReview,
} from "@/features/reviews/services/review.service";
import type {
  ProductReview,
  ReviewSortOption,
  SubmitReviewInput,
} from "@/features/reviews/types/review.type";

export const reviewKeys = {
  all: ["reviews"] as const,
  product: (itemId: string) => [...reviewKeys.all, "product", itemId] as const,
  featured: () => [...reviewKeys.all, "featured"] as const,
};

function findUserReview(
  reviews: ProductReview[],
  userName: string | null | undefined
) {
  if (!userName) return null;
  return reviews.find((review) => review.user.name === userName) ?? null;
}

export function sortReviews(
  reviews: ProductReview[],
  sortOption: ReviewSortOption
) {
  return [...reviews].sort((a, b) => {
    switch (sortOption) {
      case "highest":
        return b.rating - a.rating;
      case "lowest":
        return a.rating - b.rating;
      case "recent":
      default:
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  });
}

export function useProductReviews(productId: string) {
  const { data: session } = useSession();

  const query = useQuery({
    queryKey: reviewKeys.product(productId),
    queryFn: () => fetchProductReviews(productId),
    enabled: !!productId,
  });

  const reviews = query.data ?? [];
  const userReview = findUserReview(reviews, session?.user?.name);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  const ratingCounts = reviews.reduce(
    (counts, review) => {
      counts[review.rating] = (counts[review.rating] || 0) + 1;
      return counts;
    },
    {} as Record<number, number>
  );

  return {
    reviews,
    userReview,
    isLoading: query.isLoading,
    averageRating,
    ratingCounts,
    refetch: query.refetch,
    isAuthenticated: !!session?.user,
  };
}

export function useSubmitReview(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Omit<SubmitReviewInput, "itemId">) =>
      submitReview({ ...input, itemId: productId }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.product(productId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.featured() });
      toast.success(data.message);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit review");
    },
  });
}

export function useDeleteReview(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => deleteReview(reviewId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.product(productId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.featured() });
      toast.success(data.message);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete review");
    },
  });
}

export function useFeaturedReviews() {
  const query = useQuery({
    queryKey: reviewKeys.featured(),
    queryFn: fetchFeaturedReviews,
  });

  return {
    reviews: query.data ?? [],
    isLoading: query.isLoading,
  };
}
