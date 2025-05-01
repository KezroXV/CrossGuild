"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Trash2, Edit, CheckCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

interface Review {
  id: string;
  rating: number;
  comment?: string | null; // <-- assure que le champ comment existe
  content?: string | null; // <-- supporte aussi content pour compatibilité
  createdAt: string;
  isVerifiedPurchase: boolean;
  user: {
    name: string | null;
    image: string | null;
  };
}

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

const ProductReviews = ({ productId, productName }: ProductReviewsProps) => {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState(false);
  const [sortOption, setSortOption] = useState<string>("recent");

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reviews?itemId=${productId}`);
      const data = await response.json();

      if (response.ok) {
        // Harmonise le champ texte pour chaque review
        const reviewsWithText = (data.reviews || []).map((review: Review) => ({
          ...review,
          comment: review.comment ?? review.content ?? "",
        }));
        setReviews(reviewsWithText);

        // Check if the user has already reviewed
        if (session?.user) {
          const userReview = reviewsWithText.find(
            (review: Review) => review.user.name === session.user?.name
          );
          if (userReview) {
            setUserReview(userReview);
            setRating(userReview.rating);
            setComment(userReview.comment || "");
          }
        }
      } else {
        toast.error(data.error || "Failed to fetch reviews");
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("An error occurred while fetching reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, session]);

  const handleSubmitReview = async () => {
    if (!session) {
      toast.error("Please sign in to leave a review");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId: productId,
          rating,
          comment: comment.trim() || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          userReview
            ? "Review updated successfully"
            : "Review submitted successfully"
        );
        fetchReviews();
        setEditing(false);
      } else {
        toast.error(data.error || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("An error occurred while submitting your review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview) return;

    try {
      const response = await fetch(`/api/reviews?id=${userReview.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Review deleted successfully");
        setUserReview(null);
        setRating(5);
        setComment("");
        fetchReviews();
      } else {
        toast.error(data.error || "Failed to delete review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("An error occurred while deleting your review");
    }
  };

  const sortedReviews = [...reviews].sort((a, b) => {
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

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

      {/* Review Summary */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="w-full md:w-1/3 bg-muted/20 p-6 rounded-lg">
          <div className="flex flex-col items-center">
            <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
            <div className="flex items-center mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.round(averageRating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Based on {reviews.length}{" "}
              {reviews.length === 1 ? "review" : "reviews"}
            </div>
          </div>

          <div className="mt-6 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-sm w-6">{star}★</span>
                <div className="h-2 bg-muted rounded-full flex-1 overflow-hidden">
                  <div
                    className="h-full bg-yellow-400"
                    style={{
                      width: `${
                        ((ratingCounts[star] || 0) / reviews.length) * 100 || 0
                      }%`,
                    }}
                  />
                </div>
                <span className="text-sm w-8">{ratingCounts[star] || 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Review Form */}
        <div className="w-full md:w-2/3">
          <h3 className="text-lg font-semibold mb-4">
            {userReview && !editing
              ? "Your Review"
              : `Review this Product: ${productName}`}
          </h3>

          {!session ? (
            <div className="bg-muted/20 p-6 rounded-lg text-center">
              <p className="mb-4">Please sign in to leave a review</p>
              <Button asChild>
                <a href="/login">Sign In</a>
              </Button>
            </div>
          ) : userReview && !editing ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= userReview.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setEditing(true)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleDeleteReview}
                      className="text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="mt-4">
                  {userReview.comment || "(No comment provided)"}
                </p>
                <div className="text-sm text-muted-foreground mt-4">
                  Posted on{" "}
                  {format(new Date(userReview.createdAt), "MMMM d, yyyy")}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="bg-muted/20 p-6 rounded-lg">
              <div className="mb-4">
                <p className="mb-2">Rate this product:</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Button
                      key={star}
                      variant="ghost"
                      size="icon"
                      onClick={() => setRating(star)}
                      className={`h-10 w-10 p-0 ${
                        star <= rating ? "text-yellow-400" : "text-gray-300"
                      }`}
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= rating ? "fill-yellow-400" : ""
                        }`}
                      />
                    </Button>
                  ))}
                  <span className="ml-2 text-sm self-center">
                    {rating === 1
                      ? "Poor"
                      : rating === 2
                        ? "Below Average"
                        : rating === 3
                          ? "Average"
                          : rating === 4
                            ? "Good"
                            : "Excellent"}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="comment" className="block mb-2">
                  Your review (optional):
                </label>
                <Textarea
                  id="comment"
                  placeholder="Share your experience with this product..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={5}
                />
              </div>

              <div className="flex justify-end gap-2">
                {editing && (
                  <Button variant="outline" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                )}
                <Button onClick={handleSubmitReview} disabled={submitting}>
                  {submitting
                    ? "Submitting..."
                    : editing
                      ? "Update Review"
                      : "Submit Review"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
          </h3>
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="highest">Highest Rated</SelectItem>
              <SelectItem value="lowest">Lowest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted"></div>
                    <div>
                      <div className="h-4 w-24 bg-muted rounded"></div>
                      <div className="h-3 w-16 bg-muted rounded mt-2"></div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-3 w-full bg-muted rounded"></div>
                    <div className="h-3 w-full bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                No reviews yet. Be the first to review this product!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedReviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={review.user.image || undefined} />
                        <AvatarFallback>
                          {review.user.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">
                          {review.user.name || "Anonymous"}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3.5 w-3.5 ${
                                  star <= review.rating
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(review.createdAt), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                    </div>
                    {review.isVerifiedPurchase && (
                      <div className="flex items-center text-green-600 text-sm">
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Verified Purchase
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    {/* Affiche le texte de la review, peu importe le champ utilisé */}
                    {review.comment && review.comment.trim() !== "" ? (
                      <p>{review.comment}</p>
                    ) : review.content && review.content.trim() !== "" ? (
                      <p>{review.content}</p>
                    ) : (
                      <p className="text-muted-foreground italic">
                        (No comment provided)
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
