/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import axios from "axios";
import { useSession } from "next-auth/react";

interface Review {
  id: string;
  content: string;
  rating: number;
  user: {
    name: string;
    image?: string;
    profilePhoto?: string;
  };
  createdAt: string;
  itemId?: string;
}

const ProductReview = ({ productId }: { productId: string }) => {
  const { data: session, status } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    content: "",
    rating: 0,
  });
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, session, status]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get("/api/reviews", {
        params: { itemId: productId },
      });
      setReviews(response.data.reviews || []);

      if (session?.user?.id) {
        const already = (response.data.reviews || []).some(
          (review: Review) =>
            review.itemId === productId &&
            review.user &&
            review.user.name === session.user.name
        );
        setUserHasReviewed(already);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      toast.error("Failed to load reviews");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (status !== "authenticated") {
      toast.error("You must be logged in to submit a review");
      return;
    }

    if (!formData.content) {
      toast.error("Please write your review");
      return;
    }
    if (!formData.rating) {
      toast.error("Please select a rating");
      return;
    }

    setLoading(true);
    try {
      const reviewData = {
        itemId: productId,
        rating: formData.rating,
        comment: formData.content,
      };

      const response = await axios.post("/api/reviews", reviewData);

      toast.success("Review submitted successfully");
      setReviews((prev) => [response.data.review, ...prev]);
      setFormData({ content: "", rating: 0 });
      setIsDialogOpen(false);
      setUserHasReviewed(true);
    } catch (error: any) {
      console.error("Error submitting review:", error);
      if (error.response) {
        toast.error(error.response.data.error || "Failed to submit review");
      } else {
        toast.error("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const ReviewCard = ({ review }: { review: Review }) => {
    return (
      <div className="bg-white p-4 rounded-xl shadow-md border-accent border-2 hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-2 mb-3">
          {(review.user.image || review.user.profilePhoto) && (
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
              <Image
                src={review.user.image || review.user.profilePhoto || ""}
                alt={review.user.name}
                width={40}
                height={40}
                className="object-cover rounded-full"
              />
            </div>
          )}
          <div>
            <p className="font-semibold">{review.user.name}</p>
            <p className="text-xs text-gray-500">
              {new Date(review.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex mb-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className={`h-4 w-4 ${
                index < review.rating
                  ? "text-yellow-500 fill-yellow-500"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <p className="text-sm line-clamp-3">{review.content}</p>
      </div>
    );
  };

  return (
    <div className="space-y-8 my-12">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          Customer Reviews {reviews.length > 0 && `(${reviews.length})`}
        </h2>

        {session?.user ? (
          userHasReviewed ? (
            <Button disabled className="bg-gray-400 text-white">
              You already reviewed this product
            </Button>
          ) : (
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-accent text-white hover:bg-accent/90"
            >
              Write a Review
            </Button>
          )
        ) : (
          <Button
            onClick={() => toast.error("Please log in to write a review")}
            className="bg-gray-400 text-white hover:bg-gray-500"
          >
            Log in to Review
          </Button>
        )}
      </div>

      {reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border rounded-lg bg-gray-50">
          <p className="text-gray-500">
            No reviews yet. Be the first to review this product!
          </p>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="rating">Rating</Label>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, rating: index + 1 }))
                      }
                      className="focus:outline-none"
                      aria-label={`Rate ${index + 1} stars`}
                    >
                      <Star
                        className={`h-6 w-6 ${
                          index < formData.rating
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Your Review</Label>
                <Textarea
                  id="content"
                  placeholder="Write your review here..."
                  value={formData.content}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  rows={5}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit Review"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductReview;
