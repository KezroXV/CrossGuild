"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CheckCircle, Edit, Star, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  useDeleteReview,
  useSubmitReview,
} from "@/features/reviews/hooks/use-reviews.hook";
import type { ProductReview } from "@/features/reviews/types/review.type";

const ratingLabels: Record<number, string> = {
  1: "Poor",
  2: "Below Average",
  3: "Average",
  4: "Good",
  5: "Excellent",
};

interface ReviewFormProps {
  productId: string;
  productName: string;
  userReview: ProductReview | null;
  isAuthenticated: boolean;
}

export default function ReviewForm({
  productId,
  productName,
  userReview,
  isAuthenticated,
}: ReviewFormProps) {
  const [rating, setRating] = useState(userReview?.rating ?? 5);
  const [comment, setComment] = useState(userReview?.content ?? "");
  const [editing, setEditing] = useState(false);

  const submitMutation = useSubmitReview(productId);
  const deleteMutation = useDeleteReview(productId);

  const handleSubmit = async () => {
    await submitMutation.mutateAsync({ rating, comment });
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!userReview) return;
    await deleteMutation.mutateAsync(userReview.id);
    setRating(5);
    setComment("");
    setEditing(false);
  };

  const startEditing = () => {
    if (userReview) {
      setRating(userReview.rating);
      setComment(userReview.content);
    }
    setEditing(true);
  };

  return (
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

        {!isAuthenticated ? (
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-8 rounded-xl border-2 border-dashed border-primary/30 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <p className="text-lg font-medium mb-2">Sign in to leave a review</p>
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
                  <Button variant="outline" size="icon" onClick={startEditing}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="mt-4">
                {userReview.content || "(No comment provided)"}
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
                  {ratingLabels[rating]}
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
              <Button
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending
                  ? "Submitting..."
                  : editing
                    ? "Update Review"
                    : "Submit Review"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
