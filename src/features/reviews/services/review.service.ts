import { API_BASE_URL } from "@/config/config";
import type {
  DeleteReviewResponse,
  FeaturedReview,
  FeaturedReviewsResponse,
  ProductReview,
  ReviewsResponse,
  SubmitReviewInput,
  SubmitReviewResponse,
} from "@/features/reviews/types/review.type";

async function parseResponse<T>(res: Response): Promise<T> {
  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Request failed"
    );
  }

  return data as T;
}

function normalizeProductReview(review: {
  id: string;
  rating: number;
  content?: string | null;
  comment?: string | null;
  createdAt: string;
  isVerifiedPurchase?: boolean;
  user: { name: string | null; image: string | null };
}): ProductReview {
  return {
    id: review.id,
    rating: review.rating,
    content: review.content ?? review.comment ?? "",
    createdAt: review.createdAt,
    isVerifiedPurchase: review.isVerifiedPurchase,
    user: review.user,
  };
}

export async function fetchProductReviews(
  itemId: string
): Promise<ProductReview[]> {
  const res = await fetch(`${API_BASE_URL}/api/reviews?itemId=${itemId}`, {
    credentials: "include",
  });

  const data = await parseResponse<ReviewsResponse>(res);
  return (data.reviews ?? []).map(normalizeProductReview);
}

export async function fetchFeaturedReviews(): Promise<FeaturedReview[]> {
  const res = await fetch(`${API_BASE_URL}/api/reviews/featured`, {
    credentials: "include",
  });

  const data = await parseResponse<FeaturedReviewsResponse>(res);

  return (data.reviews ?? []).map((review) => ({
    id: review.id,
    content: review.content,
    rating: review.rating,
    user: {
      name: review.user?.name ?? "Anonymous",
      image: review.user?.image ?? null,
    },
    item: {
      name: review.item?.name ?? "Unknown Product",
      averageRating: review.item?.averageRating ?? 0,
    },
  }));
}

export async function submitReview(input: SubmitReviewInput) {
  const res = await fetch(`${API_BASE_URL}/api/reviews`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      itemId: input.itemId,
      rating: input.rating,
      comment: input.comment?.trim() || null,
    }),
  });

  const data = await parseResponse<SubmitReviewResponse>(res);
  return {
    ...data,
    review: normalizeProductReview(data.review),
  };
}

export async function deleteReview(reviewId: string) {
  const res = await fetch(`${API_BASE_URL}/api/reviews?id=${reviewId}`, {
    method: "DELETE",
    credentials: "include",
  });

  return parseResponse<DeleteReviewResponse>(res);
}
