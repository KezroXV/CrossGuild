/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MessageSquareText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

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

interface FAQ {
  id: string;
  question: string;
  answer: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isFaqDialogOpen, setIsFaqDialogOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState<Review | null>(null);
  const [currentFaq, setCurrentFaq] = useState<FAQ | null>(null);
  const [reviewFormData, setReviewFormData] = useState({
    content: "",
    rating: 0,
    userId: "",
    itemId: "",
  });
  const [faqFormData, setFaqFormData] = useState({
    question: "",
    answer: "",
    isPublished: false,
  });
  const [loading, setLoading] = useState({
    reviews: false,
    faqs: false,
  });
  // Update pagination state to handle both reviews and faqs
  const [pagination, setPagination] = useState({
    reviews: {
      currentPage: 1,
      totalPages: 1,
      pageSize: "10",
    },
    faqs: {
      currentPage: 1,
      totalPages: 1,
      pageSize: "10",
    },
  });
  const [searchTerm, setSearchTerm] = useState({
    reviews: "",
    faqs: "",
  });
  const [activeTab, setActiveTab] = useState("reviews");

  useEffect(() => {
    if (activeTab === "reviews") {
      fetchReviews();
    } else {
      fetchFaqs();
    }
  }, [
    activeTab,
    pagination.reviews.currentPage,
    pagination.reviews.pageSize,
    pagination.faqs.currentPage,
    pagination.faqs.pageSize,
    searchTerm,
  ]);

  const fetchReviews = async () => {
    setLoading({ ...loading, reviews: true });
    try {
      const response = await axios.get("/api/admin/reviews", {
        params: {
          page: pagination.reviews.currentPage,
          pageSize: parseInt(pagination.reviews.pageSize),
          search: searchTerm.reviews,
          type: "reviews",
        },
      });
      setReviews(response.data.reviews);
      setPagination({
        ...pagination,
        reviews: {
          ...pagination.reviews,
          totalPages:
            response.data.totalPages ||
            Math.ceil(
              response.data.totalCount / parseInt(pagination.reviews.pageSize)
            ),
        },
      });
    } catch (error) {
      toast.error("Failed to fetch reviews");
    } finally {
      setLoading({ ...loading, reviews: false });
    }
  };

  const fetchFaqs = async () => {
    setLoading({ ...loading, faqs: true });
    try {
      const response = await axios.get("/api/admin/reviews", {
        params: {
          page: pagination.faqs.currentPage,
          pageSize: parseInt(pagination.faqs.pageSize),
          search: searchTerm.faqs,
          type: "faqs",
        },
      });
      setFaqs(response.data.faqs);
      setPagination({
        ...pagination,
        faqs: {
          ...pagination.faqs,
          totalPages:
            response.data.totalPages ||
            Math.ceil(
              response.data.totalCount / parseInt(pagination.faqs.pageSize)
            ),
        },
      });
    } catch (error) {
      toast.error("Failed to fetch FAQs");
    } finally {
      setLoading({ ...loading, faqs: false });
    }
  };

  const handleDeleteReview = async (id: string) => {
    try {
      await axios.delete("/api/admin/reviews", { data: { id } });
      toast.success("Review deleted successfully");
      fetchReviews();
    } catch (error) {
      toast.error("Failed to delete review");
    }
  };

  const handleDeleteFaq = async (id: string) => {
    try {
      await axios.delete("/api/admin/reviews", { data: { id, type: "faq" } });
      toast.success("FAQ deleted successfully");
      fetchFaqs();
    } catch (error) {
      toast.error("Failed to delete FAQ");
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentReview) {
        await axios.put("/api/admin/reviews", {
          id: currentReview.id,
          data: reviewFormData,
        });
      } else {
        await axios.post("/api/admin/reviews", reviewFormData);
      }
      toast.success(
        `Review ${currentReview ? "updated" : "created"} successfully`
      );
      setIsReviewDialogOpen(false);
      fetchReviews();
    } catch (error) {
      toast.error(`Failed to ${currentReview ? "update" : "create"} review`);
    }
  };

  const handleFaqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentFaq) {
        await axios.put("/api/admin/reviews", {
          type: "faq",
          id: currentFaq.id,
          ...faqFormData,
        });
        toast.success("FAQ updated successfully");
      }
      setIsFaqDialogOpen(false);
      fetchFaqs();
    } catch (error) {
      toast.error("Failed to update FAQ");
    }
  };

  const handleSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "reviews" | "faqs"
  ) => {
    setSearchTerm({ ...searchTerm, [type]: e.target.value });
    // Reset to first page when searching
    setPagination({
      ...pagination,
      [type]: {
        ...pagination[type],
        currentPage: 1,
      },
    });
  };

  return (
    <div className="p-6 max-w-[95%] mx-auto">
      <Tabs
        defaultValue="reviews"
        onValueChange={setActiveTab}
        value={activeTab}
        className="w-full"
      >
        <div className="flex justify-between items-center mb-8">
          <TabsList className="mb-2">
            <TabsTrigger
              value="reviews"
              className="flex items-center gap-2 px-6 py-3"
            >
              <Star className="h-5 w-5" />
              Reviews
            </TabsTrigger>
            <TabsTrigger
              value="faqs"
              className="flex items-center gap-2 px-6 py-3"
            >
              <MessageSquareText className="h-5 w-5" />
              FAQs
            </TabsTrigger>
          </TabsList>

          {activeTab === "reviews" ? (
            <Button
              onClick={() => {
                setCurrentReview(null);
                setReviewFormData({
                  content: "",
                  rating: 0,
                  userId: "",
                  itemId: "",
                });
                setIsReviewDialogOpen(true);
              }}
              className="px-5 py-2"
              size="lg"
            >
              Add Review
            </Button>
          ) : (
            <Button
              onClick={() => {
                setCurrentFaq(null);
                setFaqFormData({
                  question: "",
                  answer: "",
                  isPublished: false,
                });
                setIsFaqDialogOpen(true);
              }}
              className="px-5 py-2"
              size="lg"
            >
              Add FAQ
            </Button>
          )}
        </div>

        <TabsContent value="reviews" className="mt-4">
          {loading.reviews && (
            <p className="text-blue-500 mb-6">Loading reviews...</p>
          )}

          <div className="mb-6">
            <Input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm.reviews}
              onChange={(e) => handleSearchChange(e, "reviews")}
              className="w-full max-w-md"
            />
          </div>

          <div className="grid gap-6">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <Card
                  key={review.id}
                  className="p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12 border-2">
                          <AvatarImage src={review.user.image || undefined} />
                          <AvatarFallback className="text-lg font-medium">
                            {review.user.name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-base">
                            {review.user.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteReview(review.id)}
                      >
                        Delete
                      </Button>
                    </div>
                    <div>
                      <div className="flex items-center space-x-1 mb-3">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-5 h-5 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                      <p className="text-sm leading-relaxed">
                        {review.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-3 pt-2 border-t">
                        Product: {review.item.name}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                No reviews found
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-8 pt-4 border-t">
            <div>
              <Select
                value={pagination.reviews.pageSize}
                onValueChange={(value) => {
                  setPagination({
                    ...pagination,
                    reviews: {
                      ...pagination.reviews,
                      pageSize: value,
                      currentPage: 1,
                    },
                  });
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Items per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 per page</SelectItem>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="25">25 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 items-center">
              <Button
                onClick={() =>
                  setPagination({
                    ...pagination,
                    reviews: {
                      ...pagination.reviews,
                      currentPage: Math.max(
                        pagination.reviews.currentPage - 1,
                        1
                      ),
                    },
                  })
                }
                disabled={pagination.reviews.currentPage === 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <span className="px-3 py-1 bg-muted rounded-md text-sm">
                Page {pagination.reviews.currentPage} of{" "}
                {pagination.reviews.totalPages}
              </span>
              <Button
                onClick={() =>
                  setPagination({
                    ...pagination,
                    reviews: {
                      ...pagination.reviews,
                      currentPage: Math.min(
                        pagination.reviews.currentPage + 1,
                        pagination.reviews.totalPages
                      ),
                    },
                  })
                }
                disabled={
                  pagination.reviews.currentPage ===
                  pagination.reviews.totalPages
                }
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="faqs" className="mt-4">
          {loading.faqs && (
            <p className="text-blue-500 mb-6">Loading FAQs...</p>
          )}

          {/* Add search input for FAQs */}
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm.faqs}
              onChange={(e) => handleSearchChange(e, "faqs")}
              className="w-full max-w-md"
            />
          </div>

          <div className="grid gap-6">
            {faqs.length > 0 ? (
              faqs.map((faq) => (
                <Card
                  key={faq.id}
                  className="p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-lg">{faq.question}</h3>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCurrentFaq(faq);
                            setFaqFormData({
                              question: faq.question,
                              answer: faq.answer || "",
                              isPublished: faq.isPublished,
                            });
                            setIsFaqDialogOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteFaq(faq.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div>
                      {faq.answer ? (
                        <p className="text-sm leading-relaxed bg-muted/30 p-3 rounded-md">
                          {faq.answer}
                        </p>
                      ) : (
                        <p className="text-sm italic text-muted-foreground p-3 border border-dashed border-muted rounded-md">
                          No answer yet
                        </p>
                      )}
                      <div className="flex justify-between items-center mt-3 pt-3 border-t">
                        <p className="text-xs text-muted-foreground">
                          Created:{" "}
                          {new Date(faq.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-medium ${
                              faq.isPublished
                                ? "text-green-600"
                                : "text-amber-600"
                            }`}
                          >
                            {faq.isPublished ? "Published" : "Draft"}
                          </span>
                          <div
                            className={`w-3 h-3 rounded-full ${
                              faq.isPublished ? "bg-green-500" : "bg-amber-500"
                            }`}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                No FAQs found
              </div>
            )}
          </div>

          {/* Add pagination for FAQs */}
          <div className="flex justify-between items-center mt-8 pt-4 border-t">
            <div>
              <Select
                value={pagination.faqs.pageSize}
                onValueChange={(value) => {
                  setPagination({
                    ...pagination,
                    faqs: {
                      ...pagination.faqs,
                      pageSize: value,
                      currentPage: 1,
                    },
                  });
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Items per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 per page</SelectItem>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="25">25 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 items-center">
              <Button
                onClick={() =>
                  setPagination({
                    ...pagination,
                    faqs: {
                      ...pagination.faqs,
                      currentPage: Math.max(pagination.faqs.currentPage - 1, 1),
                    },
                  })
                }
                disabled={pagination.faqs.currentPage === 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <span className="px-3 py-1 bg-muted rounded-md text-sm">
                Page {pagination.faqs.currentPage} of{" "}
                {pagination.faqs.totalPages}
              </span>
              <Button
                onClick={() =>
                  setPagination({
                    ...pagination,
                    faqs: {
                      ...pagination.faqs,
                      currentPage: Math.min(
                        pagination.faqs.currentPage + 1,
                        pagination.faqs.totalPages
                      ),
                    },
                  })
                }
                disabled={
                  pagination.faqs.currentPage === pagination.faqs.totalPages
                }
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {currentReview ? "Edit Review" : "Add Review"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleReviewSubmit}>
            <div className="grid gap-5 py-4">
              <div className="grid gap-2">
                <Label htmlFor="content" className="text-sm font-medium">
                  Content
                </Label>
                <Textarea
                  id="content"
                  value={reviewFormData.content}
                  onChange={(e) =>
                    setReviewFormData({
                      ...reviewFormData,
                      content: e.target.value,
                    })
                  }
                  className="min-h-[100px]"
                  placeholder="Review content"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rating" className="text-sm font-medium">
                  Rating
                </Label>
                <Input
                  id="rating"
                  type="number"
                  min="1"
                  max="5"
                  value={reviewFormData.rating}
                  onChange={(e) =>
                    setReviewFormData({
                      ...reviewFormData,
                      rating: Number(e.target.value),
                    })
                  }
                  placeholder="1-5"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="userId" className="text-sm font-medium">
                  User ID
                </Label>
                <Input
                  id="userId"
                  value={reviewFormData.userId}
                  onChange={(e) =>
                    setReviewFormData({
                      ...reviewFormData,
                      userId: e.target.value,
                    })
                  }
                  placeholder="User ID"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="itemId" className="text-sm font-medium">
                  Product ID
                </Label>
                <Input
                  id="itemId"
                  value={reviewFormData.itemId}
                  onChange={(e) =>
                    setReviewFormData({
                      ...reviewFormData,
                      itemId: e.target.value,
                    })
                  }
                  placeholder="Product ID"
                />
              </div>
            </div>
            <DialogFooter className="mt-2">
              <Button type="submit" className="w-full sm:w-auto">
                {currentReview ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* FAQ Dialog */}
      <Dialog open={isFaqDialogOpen} onOpenChange={setIsFaqDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {currentFaq ? "Edit FAQ" : "Add FAQ"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFaqSubmit}>
            <div className="grid gap-5 py-4">
              <div className="grid gap-2">
                <Label htmlFor="question" className="text-sm font-medium">
                  Question
                </Label>
                <Input
                  id="question"
                  value={faqFormData.question}
                  onChange={(e) =>
                    setFaqFormData({ ...faqFormData, question: e.target.value })
                  }
                  placeholder="Question"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="answer" className="text-sm font-medium">
                  Answer
                </Label>
                <Textarea
                  id="answer"
                  rows={5}
                  value={faqFormData.answer}
                  onChange={(e) =>
                    setFaqFormData({ ...faqFormData, answer: e.target.value })
                  }
                  placeholder="Provide an answer"
                  className="min-h-[120px]"
                />
              </div>
              <div className="flex items-center justify-between gap-4 bg-muted/20 p-3 rounded-md">
                <Label
                  htmlFor="published"
                  className="text-sm font-medium cursor-pointer"
                >
                  Publish FAQ
                </Label>
                <Switch
                  id="published"
                  checked={faqFormData.isPublished}
                  onCheckedChange={(checked) =>
                    setFaqFormData({ ...faqFormData, isPublished: checked })
                  }
                />
              </div>
            </div>
            <DialogFooter className="mt-2">
              <Button type="submit" className="w-full sm:w-auto">
                {currentFaq ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
