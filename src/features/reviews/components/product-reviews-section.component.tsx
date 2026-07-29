"use client";

import { Star } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import ReviewForm from "@/features/reviews/components/review-form.component";
import ReviewList from "@/features/reviews/components/review-list.component";
import { useProductReviews } from "@/features/reviews/hooks/use-reviews.hook";

interface ProductReviewsSectionProps {
  productId: string;
  productName: string;
}

export default function ProductReviewsSection({
  productId,
  productName,
}: ProductReviewsSectionProps) {
  const {
    reviews,
    userReview,
    isLoading,
    averageRating,
    ratingCounts,
    isAuthenticated,
  } = useProductReviews(productId);

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
        </div>

        <div className="flex flex-col lg:flex-row gap-8 mb-12">
          <div className="w-full lg:w-1/3">
            <Card className="border-2 border-accent/20 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-background via-background to-accent/5">
              <CardContent className="p-8 relative overflow-hidden">
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
                              reviews.length > 0
                                ? ((ratingCounts[star] || 0) / reviews.length) *
                                  100
                                : 0
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
              </CardContent>
            </Card>
          </div>

          <div className="w-full lg:w-2/3">
            <ReviewForm
              key={userReview?.id ?? "new"}
              productId={productId}
              productName={productName}
              userReview={userReview}
              isAuthenticated={isAuthenticated}
            />
          </div>
        </div>

        <ReviewList
          reviews={reviews}
          isLoading={isLoading}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </div>
  );
}
