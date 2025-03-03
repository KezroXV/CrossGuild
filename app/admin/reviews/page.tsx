"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Review {
  id: string;
  content: string;
  rating: number;
  userId: string;
  itemId: string;
  createdAt: string;
  user: {
    name: string;
    image: string | null;
  };
  item: {
    name: string;
  };
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState<Review | null>(null);
  const [formData, setFormData] = useState({
    content: "",
    rating: 0,
    userId: "",
    itemId: "",
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await axios.get("/api/admin/reviews");
      setReviews(response.data.reviews);
    } catch (error) {
      toast.error("Failed to fetch reviews");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete("/api/admin/reviews", { data: { id } });
      toast.success("Review deleted successfully");
      fetchReviews();
    } catch (error) {
      toast.error("Failed to delete review");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentReview) {
        await axios.put("/api/admin/reviews", {
          id: currentReview.id,
          data: formData,
        });
      } else {
        await axios.post("/api/admin/reviews", formData);
      }
      toast.success(
        `Review ${currentReview ? "updated" : "created"} successfully`
      );
      setIsDialogOpen(false);
      fetchReviews();
    } catch (error) {
      toast.error(`Failed to ${currentReview ? "update" : "create"} review`);
    }
  };

  return (
    <div className=" p-6 max-w-[80%]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reviews Management</h1>
        <Button
          onClick={() => {
            setCurrentReview(null);
            setFormData({ content: "", rating: 0, userId: "", itemId: "" });
            setIsDialogOpen(true);
          }}
        >
          Add Review
        </Button>
      </div>

      <div className="grid gap-4">
        {reviews.map((review) => (
          <Card key={review.id} className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={review.user.image || undefined} />
                    <AvatarFallback>
                      {review.user.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{review.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(review.id)}
                >
                  Delete
                </Button>
              </div>
              <div>
                <div className="flex items-center space-x-1 mb-2">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-sm">{review.content}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Product: {review.item.name}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentReview ? "Edit Review" : "Add Review"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                <Input
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rating">Rating</Label>
                <Input
                  id="rating"
                  type="number"
                  min="1"
                  max="5"
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData({ ...formData, rating: Number(e.target.value) })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  value={formData.userId}
                  onChange={(e) =>
                    setFormData({ ...formData, userId: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="itemId">Product ID</Label>
                <Input
                  id="itemId"
                  value={formData.itemId}
                  onChange={(e) =>
                    setFormData({ ...formData, itemId: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {currentReview ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
