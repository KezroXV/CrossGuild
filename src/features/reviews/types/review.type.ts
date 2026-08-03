import { ReviewStatus } from "@prisma/client";

export { ReviewStatus };

export const REVIEW_STATUSES = [
  ReviewStatus.pending,
  ReviewStatus.approved,
  ReviewStatus.rejected,
] as const;

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  [ReviewStatus.pending]: "Pending",
  [ReviewStatus.approved]: "Approved",
  [ReviewStatus.rejected]: "Rejected",
};

export function getReviewStatusLabel(status: ReviewStatus): string {
  return REVIEW_STATUS_LABELS[status] ?? status;
}

export type ReviewUser = {
  name: string | null;
  image: string | null;
};

export type ProductReview = {
  id: string;
  rating: number;
  content: string;
  createdAt: string;
  isVerifiedPurchase?: boolean;
  user: ReviewUser;
};

export type FeaturedReview = {
  id: string;
  content: string;
  rating: number;
  user: {
    name: string;
    image: string | null;
  };
  item: {
    name: string;
    averageRating: number;
  };
};

export type ReviewsResponse = {
  reviews: ProductReview[];
};

export type FeaturedReviewsResponse = {
  reviews: FeaturedReview[];
};

export type SubmitReviewInput = {
  itemId: string;
  rating: number;
  comment?: string | null;
};

export type ReviewSortOption = "recent" | "highest" | "lowest";

export type SubmitReviewResponse = {
  message: string;
  review: ProductReview;
};

export type DeleteReviewResponse = {
  message: string;
};
