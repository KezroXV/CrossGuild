"use client";

import { useState, useEffect, useCallback } from "react";
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
  const fetchReviews = useCallback(async () => {
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
  }, [productId, session]);
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

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
    <div className="mt-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Customer Reviews
          </h2>
          <p className="text-muted-foreground text-lg">
            See what our customers are saying about this product
          </p>
        </div>{" "}
        {/* Review Summary */}
        <div className="flex flex-col lg:flex-row gap-8 mb-12">
          <div className="w-full lg:w-1/3">
            <Card className="border-2 border-accent/20 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-background via-background to-accent/5">
              <CardContent className="p-8 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary/10 to-accent/10 rounded-full translate-y-12 -translate-x-12"></div>

                <div className="text-center relative z-10">
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-xl"></div>
                    <div className="relative text-7xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 bg-clip-text text-transparent">
                      {averageRating.toFixed(1)}
                    </div>
                    <div className="absolute -top-3 -right-3 text-3xl animate-pulse">
                      ⭐
                    </div>
                  </div>
                  <div className="flex items-center justify-center mt-4 gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-7 w-7 transition-all duration-300 hover:scale-110 ${
                          star <= Math.round(averageRating)
                            ? "text-yellow-400 fill-yellow-400 drop-shadow-sm"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground font-semibold bg-muted/50 px-4 py-2 rounded-full inline-block">
                    Based on {reviews.length}{" "}
                    {reviews.length === 1 ? "review" : "reviews"}
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-3 group">
                      <span className="text-sm font-medium w-8 flex items-center">
                        {star}
                        <Star className="h-3 w-3 ml-1 text-yellow-400 fill-yellow-400" />
                      </span>
                      <div className="h-3 bg-muted rounded-full flex-1 overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: `${
                              ((ratingCounts[star] || 0) / reviews.length) *
                                100 || 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-10 text-right text-muted-foreground">
                        {ratingCounts[star] || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>{" "}
            </Card>
          </div>

          {/* Review Form */}
          <div className="w-full lg:w-2/3">
            <Card className="border-2 border-accent/20 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-background to-background/50 backdrop-blur-sm">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  {userReview && !editing ? (
                    <>
                      <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      </div>
                      <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        Your Review
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="p-2 rounded-full bg-primary/10">
                        <Edit className="h-6 w-6 text-primary" />
                      </div>
                      <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Review: {productName}
                      </span>
                    </>
                  )}
                </h3>

                {!session ? (
                  <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-8 rounded-xl border-2 border-dashed border-primary/30 text-center">
                    <div className="mb-4">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <CheckCircle className="h-8 w-8 text-primary" />
                      </div>
                      <p className="text-lg font-medium mb-2">
                        Sign in to leave a review
                      </p>
                      <p className="text-muted-foreground">
                        Share your experience with other customers
                      </p>
                    </div>
                    <Button
                      asChild
                      size="lg"
                      className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                    >
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
                              star <= rating
                                ? "text-yellow-400"
                                : "text-gray-300"
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
                        <Button
                          variant="outline"
                          onClick={() => setEditing(false)}
                        >
                          Cancel
                        </Button>
                      )}
                      <Button
                        onClick={handleSubmitReview}
                        disabled={submitting}
                      >
                        {submitting
                          ? "Submitting..."
                          : editing
                            ? "Update Review"
                            : "Submit Review"}
                      </Button>{" "}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Reviews List */}
        <div>
          {" "}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Authentic feedback from verified customers
              </p>
            </div>
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-[200px] border-2 border-accent/20 hover:border-accent/40 transition-colors">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">📅 Most Recent</SelectItem>
                <SelectItem value="highest">⭐ Highest Rated</SelectItem>
                <SelectItem value="lowest">📉 Lowest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {loading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <Card
                  key={i}
                  className="animate-pulse border-2 border-muted/50"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-muted to-muted/50"></div>
                      <div className="flex-1">
                        <div className="h-5 w-32 bg-gradient-to-r from-muted to-muted/50 rounded mb-2"></div>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, starIndex) => (
                              <div
                                key={starIndex}
                                className="w-4 h-4 bg-muted rounded"
                              ></div>
                            ))}
                          </div>
                          <div className="h-3 w-20 bg-muted rounded"></div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 space-y-2">
                      <div className="h-4 w-full bg-gradient-to-r from-muted to-muted/50 rounded"></div>
                      <div className="h-4 w-4/5 bg-gradient-to-r from-muted to-muted/50 rounded"></div>
                      <div className="h-4 w-3/5 bg-gradient-to-r from-muted to-muted/50 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <Card className="border-2 border-dashed border-muted/50 bg-gradient-to-br from-background to-muted/5">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                  <Star className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                  No reviews yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Be the first to review this product and help other customers
                  make informed decisions!
                </p>
                {session && (
                  <Button
                    onClick={() =>
                      document
                        .getElementById("comment")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                  >
                    Write a Review
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {sortedReviews.map((review) => (
                <Card
                  key={review.id}
                  className="border-2 border-muted/50 hover:border-accent/30 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background to-muted/5"
                >
                  <CardContent className="p-6 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-accent/5 to-primary/5 rounded-full -translate-y-10 translate-x-10"></div>

                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Avatar className="w-12 h-12 border-2 border-accent/20">
                            <AvatarImage src={review.user.image || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-primary/10 to-accent/10 text-foreground font-semibold">
                              {review.user.name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          {review.isVerifiedPurchase && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-lg text-foreground">
                            {review.user.name || "Anonymous"}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 transition-colors ${
                                    star <= review.rating
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground font-medium bg-muted/50 px-2 py-1 rounded-full">
                              {format(
                                new Date(review.createdAt),
                                "MMM d, yyyy"
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      {review.isVerifiedPurchase && (
                        <div className="flex items-center text-green-600 text-sm bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full border border-green-200 dark:border-green-800">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          <span className="font-medium">Verified Purchase</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-6 relative z-10">
                      {/* Affiche le texte de la review, peu importe le champ utilisé */}
                      {review.comment && review.comment.trim() !== "" ? (
                        <div className="bg-muted/30 p-4 rounded-lg border-l-4 border-accent/50">
                          <p className="text-foreground leading-relaxed">
                            {review.comment}
                          </p>
                        </div>
                      ) : review.content && review.content.trim() !== "" ? (
                        <div className="bg-muted/30 p-4 rounded-lg border-l-4 border-accent/50">
                          <p className="text-foreground leading-relaxed">
                            {review.content}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-muted/20 p-4 rounded-lg border-l-4 border-muted/50">
                          <p className="text-muted-foreground italic">
                            (No comment provided)
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductReviews;
