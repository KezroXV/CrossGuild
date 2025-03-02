"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Review {
  id: string;
  content: string;
  rating: number;
  userId: string;
  itemId: string;
  user: {
    name: string;
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
    <div className="container mx-auto p-6">
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Content</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map((review) => (
            <TableRow key={review.id}>
              <TableCell>{review.content}</TableCell>
              <TableCell>{review.rating}</TableCell>
              <TableCell>{review.user.name}</TableCell>
              <TableCell>{review.item.name}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentReview(review);
                      setFormData({
                        content: review.content,
                        rating: review.rating,
                        userId: review.userId,
                        itemId: review.itemId,
                      });
                      setIsDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(review.id)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
