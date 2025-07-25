"use client";
import { useEffect, useState } from "react";
import { Marquee } from "./magicui/marquee";

interface Review {
  id: string;
  content: string;
  rating: number;
  user: {
    name: string;
    image: string; // This should match the User model field in Prisma which is "image" not "profilePhoto"
  };
  item: {
    name: string;
    averageRating: number;
  };
}

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const ReviewCard = ({
  user,
  content,
  rating,
  item,
}: {
  user: { name: string; image: string };
  content: string;
  rating: number;
  item: { name: string; averageRating: number };
}) => {
  // Get initials from user name for avatar fallback
  const getInitials = (name: string) => {
    if (!name || name === "Anonymous" || name === "Anonymous User") return "?";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <figure className="relative w-64 cursor-pointer overflow-hidden rounded-xl shadow-md border-accent border-2 p-4 transition-transform transform hover:scale-105 hover:shadow-2xl bg-background">
      <div className="absolute inset-0 rounded-xl border-gradient1"></div>
      <div className="relative flex flex-row items-center gap-2">
        <Avatar className="w-8 h-8">
          {user.image && (
            <AvatarImage
              src={user.image}
              alt={`${user.name || "User"}'s profile`}
            />
          )}
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium text-foreground">
            {user.name || "Anonymous User"}
          </figcaption>
          <p className="text-xs font-medium text-muted-foreground">
            Verified Purchase
          </p>
        </div>
      </div>
      <div className="mt-2 text-sm line-clamp-3 text-foreground">{content}</div>
      <div className="mt-2 flex justify-between items-center">
        <div className="text-sm text-yellow-500">
          {"★".repeat(rating)}
          {"☆".repeat(5 - rating)}
        </div>
        <div className="text-xs text-muted-foreground">
          Average: {item.averageRating.toFixed(1)}/5
        </div>
      </div>
    </figure>
  );
};

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/admin/reviews");
        const data = await response.json();

        // Log the raw data to help with debugging
        console.log("Raw review data:", data);
        if (data.reviews && Array.isArray(data.reviews)) {
          // Make sure we're mapping the correct field names
          const formattedReviews = data.reviews.map(
            (review: {
              id: string;
              content: string;
              rating: number;
              user?: {
                name?: string;
                image?: string;
              };
              item?: {
                name?: string;
                averageRating?: number;
              };
            }) => ({
              id: review.id,
              content: review.content,
              rating: review.rating,
              user: {
                name: review.user?.name || "Anonymous",
                image: review.user?.image || null, // No default image path, will use AvatarFallback instead
              },
              item: {
                name: review.item?.name || "Unknown Product",
                averageRating: review.item?.averageRating || 0,
              },
            })
          );

          setReviews(formattedReviews);
          console.log("Formatted reviews:", formattedReviews);
        } else {
          console.error("Invalid review data format:", data);
        }
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchReviews();
  }, []);
  // If loading or no reviews, show placeholder content or skeleton
  if (isLoading) {
    return (
      <div className="my-28 w-full px-4 text-center">
        <h2 className="text-4xl text-foreground font-bold w-fit mx-auto">
          Loading <span className="text-accent">Reviews</span>...
        </h2>
      </div>
    );
  }

  // Process reviews when available
  const firstRow = reviews.slice(0, Math.ceil(reviews.length / 2));
  const secondRow = reviews.slice(Math.ceil(reviews.length / 2));
  return (
    <div className="my-28 mt-28 w-full px-4">
      <h2 className="text-4xl text-foreground font-bold mb-8 md:ml-12 lg:ml-24 xl:ml-32 w-fit">
        What Our <span className="text-accent">Customers Say</span>
      </h2>
      <div className="relative flex flex-col gap-4 py-4">
        {firstRow.length > 0 && (
          <Marquee
            className="[--gap:1rem] [--duration:40s]"
            pauseOnHover
            repeat={2}
          >
            {firstRow.map((review) => (
              <ReviewCard
                key={`first-${review.id}`}
                user={{
                  name: review.user.name,
                  image: review.user.image,
                }}
                content={review.content}
                rating={review.rating}
                item={review.item}
              />
            ))}
          </Marquee>
        )}

        {secondRow.length > 0 && (
          <Marquee
            className="[--gap:1rem] [--duration:35s]"
            reverse
            pauseOnHover
            repeat={2}
          >
            {secondRow.map((review) => (
              <ReviewCard
                key={`second-${review.id}`}
                user={{
                  name: review.user.name,
                  image: review.user.image,
                }}
                content={review.content}
                rating={review.rating}
                item={review.item}
              />
            ))}
          </Marquee>
        )}

        {reviews.length === 0 && !isLoading && (
          <p className="text-center py-10 text-foreground">No reviews found.</p>
        )}
      </div>
    </div>
  );
}
