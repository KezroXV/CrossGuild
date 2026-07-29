"use client";

import { Marquee } from "@/shared/components/magicui/marquee";
import ReviewCard from "@/features/reviews/components/review-card.component";
import { useFeaturedReviews } from "@/features/reviews/hooks/use-reviews.hook";

export default function ReviewTestimonials() {
  const { reviews, isLoading } = useFeaturedReviews();

  if (isLoading) {
    return (
      <div className="my-28 w-full px-4">
        <div className="mb-12 md:ml-12 lg:ml-24 xl:ml-32">
          <div className="h-10 w-96 bg-muted rounded animate-pulse mb-3"></div>
          <div className="h-4 w-64 bg-muted/60 rounded animate-pulse"></div>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted rounded-xl h-48 w-64"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const firstRow = reviews.slice(0, Math.ceil(reviews.length / 2));
  const secondRow = reviews.slice(Math.ceil(reviews.length / 2));

  return (
    <div className="my-32 w-full px-4 overflow-hidden">
      <div className="mb-12 md:ml-12 lg:ml-24 xl:ml-32">
        <h2 className="text-3xl md:text-4xl text-foreground font-bold w-fit">
          What Our <span className="text-accent">Customers Say</span>
        </h2>
        <p className="text-muted-foreground mt-3 text-sm md:text-base">
          Découvrez les avis authentiques de nos clients satisfaits
        </p>
      </div>

      <div className="relative flex flex-col gap-6 py-4">
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>

        {firstRow.length > 0 && (
          <Marquee
            className="[--gap:1.5rem] [--duration:40s]"
            pauseOnHover
            repeat={2}
          >
            {firstRow.map((review) => (
              <ReviewCard
                key={`first-${review.id}`}
                variant="testimonial"
                review={review}
              />
            ))}
          </Marquee>
        )}

        {secondRow.length > 0 && (
          <Marquee
            className="[--gap:1.5rem] [--duration:35s]"
            reverse
            pauseOnHover
            repeat={2}
          >
            {secondRow.map((review) => (
              <ReviewCard
                key={`second-${review.id}`}
                variant="testimonial"
                review={review}
              />
            ))}
          </Marquee>
        )}

        {reviews.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 opacity-20">💬</div>
            <p className="text-foreground/60 text-lg">
              Aucun avis disponible pour le moment
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
