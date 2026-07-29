"use client";

import { format } from "date-fns";
import { CheckCircle, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Card, CardContent } from "@/shared/components/ui/card";
import type {
  FeaturedReview,
  ProductReview,
} from "@/features/reviews/types/review.type";

function getInitials(name: string | null | undefined) {
  if (!name || name === "Anonymous" || name === "Anonymous User") return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

type ProductReviewCardProps = {
  review: ProductReview;
  variant?: "product";
};

type TestimonialReviewCardProps = {
  review: FeaturedReview;
  variant: "testimonial";
};

type ReviewCardProps = ProductReviewCardProps | TestimonialReviewCardProps;

export default function ReviewCard(props: ReviewCardProps) {
  if (props.variant === "testimonial") {
    return <TestimonialCard review={props.review} />;
  }

  return <ProductCard review={props.review} />;
}

function TestimonialCard({ review }: { review: FeaturedReview }) {
  return (
    <figure className="relative w-64 cursor-pointer overflow-hidden rounded-xl shadow-md border-accent border-2 p-4 transition-transform transform hover:scale-105 hover:shadow-2xl bg-background">
      <div className="absolute inset-0 rounded-xl border-gradient1"></div>
      <div className="relative flex flex-row items-center gap-2">
        <Avatar className="w-8 h-8">
          {review.user.image && (
            <AvatarImage
              src={review.user.image}
              alt={`${review.user.name}'s profile`}
            />
          )}
          <AvatarFallback>{getInitials(review.user.name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium text-foreground">
            {review.user.name}
          </figcaption>
          <p className="text-xs font-medium text-muted-foreground">
            Verified Purchase
          </p>
        </div>
      </div>
      <div className="mt-2 text-sm line-clamp-3 text-foreground">
        {review.content}
      </div>
      <div className="mt-2 flex justify-between items-center">
        <div className="text-sm text-yellow-500">
          {"★".repeat(review.rating)}
          {"☆".repeat(5 - review.rating)}
        </div>
        <div className="text-xs text-muted-foreground">
          Average: {review.item.averageRating.toFixed(1)}/5
        </div>
      </div>
    </figure>
  );
}

function ProductCard({ review }: { review: ProductReview }) {
  return (
    <Card className="border-2 border-muted/50 hover:border-accent/30 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background to-muted/5">
      <CardContent className="p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-accent/5 to-primary/5 rounded-full -translate-y-10 translate-x-10"></div>

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-12 h-12 border-2 border-accent/20">
                <AvatarImage src={review.user.image || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary/10 to-accent/10 text-foreground font-semibold">
                  {getInitials(review.user.name)}
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
                  {format(new Date(review.createdAt), "MMM d, yyyy")}
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
          {review.content.trim() !== "" ? (
            <div className="bg-muted/30 p-4 rounded-lg border-l-4 border-accent/50">
              <p className="text-foreground leading-relaxed">{review.content}</p>
            </div>
          ) : (
            <div className="bg-muted/20 p-4 rounded-lg border-l-4 border-muted/50">
              <p className="text-muted-foreground italic">(No comment provided)</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
