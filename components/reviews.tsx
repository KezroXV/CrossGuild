"use client";
import { useEffect, useState } from "react";
import { Marquee } from "./magicui/marquee";
import Image from "next/image";

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
    averageRating: number;
  };
}

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
  return (
    <figure className="relative  w-64 cursor-pointer overflow-hidden rounded-xl shadow-md border-accent border-2 p-4 transition-transform transform hover:scale-105 hover:shadow-2xl bg-white ">
      <div className="absolute  inset-0 rounded-xl border-gradient1"></div>
      <div className="relative flex flex-row items-center gap-2">
        <Image
          className="rounded-full"
          width="32"
          height="32"
          alt=""
          src={user.image}
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
      <div className="mt-2 flex justify-between items-center">
        <div className="text-sm text-yellow-500">
          {"★".repeat(rating)}
          {"☆".repeat(5 - rating)}
        </div>
        <div className="text-xs text-gray-500">
          Average: {item.averageRating.toFixed(1)}/5
        </div>
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
    <div className="my-28 mt-28 max-w-5/6 mx-auto">
      <h2 className="text-4xl text-black font-bold ml-48 w-fit text-left">
        What Our <span className="text-accent">Customers Say</span>
      </h2>
      <div className="relative flex flex-col gap-4 py-4">
        <Marquee className="[--gap:1rem] [--duration:20s]" pauseOnHover>
          {firstRow.map((review) => (
            <ReviewCard
              key={review.id}
              user={{ name: review.user.name, image: review.user.profilePhoto }}
              content={review.content}
              rating={review.rating}
              item={review.item}
            />
          ))}
        </Marquee>

        <Marquee className="[--gap:1rem] [--duration:20s]" reverse pauseOnHover>
          {secondRow.map((review) => (
            <ReviewCard
              key={review.id}
              user={{ name: review.user.name, image: review.user.profilePhoto }}
              content={review.content}
              rating={review.rating}
              item={review.item}
            />
          ))}
        </Marquee>
      </div>
    </div>
  );
}
