"use client";
import { useEffect, useState } from "react";
import Marquee from "./magicui/marquee";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  content: string;
  rating: number;
  user: {
    name: string;
    profilePhoto: string; // Add profile photo field
  };
  item: {
    name: string;
  };
}

const ReviewCard = ({
  user,
  content,
  rating,
}: {
  user: { name: string; profilePhoto: string };
  content: string;
  rating: number;
}) => {
  return (
    <figure className="relative w-64 cursor-pointer overflow-hidden rounded-xl border border-purple-500 p-4 transition-transform transform hover:scale-105 hover:shadow-2xl bg-white ">
      <div className="absolute inset-0 rounded-xl border-gradient1"></div>
      <div className="relative flex flex-row items-center gap-2">
        <img
          className="rounded-full"
          width="32"
          height="32"
          alt=""
          src={user.profilePhoto}
        />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-black">
            {user.name}
          </figcaption>
          <p className="text-xs font-medium  dark:text-black/40">
            Verified Purchase
          </p>
        </div>
      </div>
      <div className="mt-2 text-sm line-clamp-3">{content}</div>
      <div className="mt-2 text-sm text-yellow-500">
        {"★".repeat(rating)}
        {"☆".repeat(5 - rating)}
      </div>
    </figure>
  );
};

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await fetch("/api/admin/reviews");
        const data = await response.json();
        setReviews(data.reviews);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      }
    }

    fetchReviews();
  }, []);

  const firstRow = reviews.slice(0, Math.ceil(reviews.length / 2));
  const secondRow = reviews.slice(Math.ceil(reviews.length / 2));

  return (
    <div className="mt-28 max-w-5/6 mx-auto">
      <h2 className="text-4xl text-purple-500 font-bold tracking-widest text-center">
        What Our <span className="text-purple-700">Customers Say</span>
      </h2>
      <div className="relative flex bg-gray-100 mt-8 mb-12 w-full flex-col items-center justify-center overflow-hidden">
        <Marquee pauseOnHover className="[--duration:20s]">
          {firstRow.map((review) => (
            <ReviewCard key={review.id} {...review} />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover className="[--duration:20s]">
          {secondRow.map((review) => (
            <ReviewCard key={review.id} {...review} />
          ))}
        </Marquee>
      </div>
    </div>
  );
}
