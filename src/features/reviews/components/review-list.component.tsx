"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import ReviewCard from "@/features/reviews/components/review-card.component";
import { sortReviews } from "@/features/reviews/hooks/use-reviews.hook";
import type {
  ProductReview,
  ReviewSortOption,
} from "@/features/reviews/types/review.type";

interface ReviewListProps {
  reviews: ProductReview[];
  isLoading: boolean;
  isAuthenticated: boolean;
}

export default function ReviewList({
  reviews,
  isLoading,
  isAuthenticated,
}: ReviewListProps) {
  const [sortOption, setSortOption] = useState<ReviewSortOption>("recent");
  const sortedReviews = sortReviews(reviews, sortOption);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Authentic feedback from verified customers
          </p>
        </div>
        <Select
          value={sortOption}
          onValueChange={(value) => setSortOption(value as ReviewSortOption)}
        >
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

      {isLoading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse border-2 border-muted/50">
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
              Be the first to review this product and help other customers make
              informed decisions!
            </p>
            {isAuthenticated && (
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
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}
