"use client";

import { Star } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { ReviewRowActions } from "@/features/admin/components/reviews/review-moderation-actions.component";
import type { AdminReview } from "@/features/admin/types/admin.type";

interface ReviewsTableProps {
  reviews: AdminReview[];
  onDelete: (id: string) => void;
}

export default function ReviewsTable({ reviews, onDelete }: ReviewsTableProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No reviews found
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {reviews.map((review) => (
        <Card
          key={review.id}
          className="p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12 border-2">
                  <AvatarImage src={review.user.image || undefined} />
                  <AvatarFallback className="text-lg font-medium">
                    {review.user.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-base">{review.user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <ReviewRowActions reviewId={review.id} onDelete={onDelete} />
            </div>
            <div>
              <div className="flex items-center space-x-1 mb-3">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-sm leading-relaxed">{review.content}</p>
              <p className="text-xs text-muted-foreground mt-3 pt-2 border-t">
                Product: {review.item.name}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
