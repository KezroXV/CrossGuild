/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MessageSquareText, Mail } from "lucide-react";
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

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  department: string;
  createdAt: string;
  isResolved: boolean;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
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
    contacts: false,
  });
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
    contacts: {
      currentPage: 1,
      totalPages: 1,
      pageSize: "10",
    },
  });
  const [searchTerm, setSearchTerm] = useState({
    reviews: "",
    faqs: "",
    contacts: "",
  });
  const [activeTab, setActiveTab] = useState("reviews");

  useEffect(() => {
    if (activeTab === "reviews") {
      fetchReviews();
    } else if (activeTab === "faqs") {
      fetchFaqs();
    } else if (activeTab === "contacts") {
      fetchContactMessages();
    }
  }, [
    activeTab,
    pagination.reviews.currentPage,
    pagination.reviews.pageSize,
    pagination.faqs.currentPage,
    pagination.faqs.pageSize,
    pagination.contacts.currentPage,
    pagination.contacts.pageSize,
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

  const fetchContactMessages = async () => {
    setLoading({ ...loading, contacts: true });
    try {
      const response = await axios.get("/api/admin/reviews", {
        params: {
          page: pagination.contacts.currentPage,
          pageSize: parseInt(pagination.contacts.pageSize),
          search: searchTerm.contacts,
          type: "contacts",
        },
      });
      setContactMessages(response.data.contacts);
      setPagination({
        ...pagination,
        contacts: {
          ...pagination.contacts,
          totalPages:
            response.data.totalPages ||
            Math.ceil(
              response.data.totalCount / parseInt(pagination.contacts.pageSize)
            ),
        },
      });
    } catch (error) {
      toast.error("Failed to fetch contact messages");
    } finally {
      setLoading({ ...loading, contacts: false });
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

  const handleResolveContactMessage = async (
    id: string,
    isResolved: boolean
  ) => {
    try {
      await axios.put("/api/admin/reviews", {
        id,
        type: "contact",
        isResolved,
      });
      toast.success(
        `Message marked as ${isResolved ? "resolved" : "unresolved"}`
      );
      fetchContactMessages();
    } catch (error) {
      toast.error("Failed to update message status");
    }
  };

  const handleDeleteContactMessage = async (id: string) => {
    try {
      await axios.delete("/api/admin/reviews", {
        data: { id, type: "contact" },
      });
      toast.success("Contact message deleted successfully");
      fetchContactMessages();
    } catch (error) {
      toast.error("Failed to delete message");
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
    type: "reviews" | "faqs" | "contacts"
  ) => {
    setSearchTerm({ ...searchTerm, [type]: e.target.value });
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
            <TabsTrigger
              value="contacts"
              className="flex items-center gap-2 px-6 py-3"
            >
              <Mail className="h-5 w-5" />
              Contact Messages
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
          ) : activeTab === "faqs" ? (
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
          ) : null}
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

        <TabsContent value="contacts" className="mt-4">
          {loading.contacts && (
            <p className="text-blue-500 mb-6">Loading messages...</p>
          )}

          <div className="mb-6">
            <Input
              type="text"
              placeholder="Search messages..."
              value={searchTerm.contacts}
              onChange={(e) => handleSearchChange(e, "contacts")}
              className="w-full max-w-md"
            />
          </div>

          <div className="grid gap-6">
            {contactMessages.length > 0 ? (
              contactMessages.map((message) => (
                <Card
                  key={message.id}
                  className={`p-5 shadow-sm hover:shadow-md transition-shadow ${
                    message.isResolved ? "bg-muted/20" : "bg-background"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">
                            {message.subject}
                          </h3>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              message.isResolved
                                ? "bg-green-100 text-green-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {message.isResolved ? "Resolved" : "Pending"}
                          </span>
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                          <p>From: {message.name}</p>
                          <p>
                            Department:{" "}
                            {message.department === "customer_support"
                              ? "Customer Support"
                              : message.department === "technical"
                                ? "Technical Help"
                                : message.department === "billing"
                                  ? "Billing"
                                  : "General Inquiry"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant={message.isResolved ? "outline" : "default"}
                          size="sm"
                          onClick={() =>
                            handleResolveContactMessage(
                              message.id,
                              !message.isResolved
                            )
                          }
                        >
                          {message.isResolved ? "Mark Unresolved" : "Resolve"}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteContactMessage(message.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm leading-relaxed bg-muted/30 p-3 rounded-md">
                        {message.message}
                      </p>

                      <div className="flex justify-between items-center mt-3 pt-3 border-t">
                        <p className="text-xs text-muted-foreground">
                          Received:{" "}
                          {new Date(message.createdAt).toLocaleDateString()} at{" "}
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </p>
                        <a
                          href={`mailto:${message.email}`}
                          className="text-sm text-primary hover:underline"
                        >
                          Reply via Email
                        </a>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                No contact messages found
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-8 pt-4 border-t">
            <div>
              <Select
                value={pagination.contacts.pageSize}
                onValueChange={(value) => {
                  setPagination({
                    ...pagination,
                    contacts: {
                      ...pagination.contacts,
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
                    contacts: {
                      ...pagination.contacts,
                      currentPage: Math.max(
                        pagination.contacts.currentPage - 1,
                        1
                      ),
                    },
                  })
                }
                disabled={pagination.contacts.currentPage === 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <span className="px-3 py-1 bg-muted rounded-md text-sm">
                Page {pagination.contacts.currentPage} of{" "}
                {pagination.contacts.totalPages}
              </span>
              <Button
                onClick={() =>
                  setPagination({
                    ...pagination,
                    contacts: {
                      ...pagination.contacts,
                      currentPage: Math.min(
                        pagination.contacts.currentPage + 1,
                        pagination.contacts.totalPages
                      ),
                    },
                  })
                }
                disabled={
                  pagination.contacts.currentPage ===
                  pagination.contacts.totalPages
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentReview ? "Edit Review" : "Add Review"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <Label htmlFor="content">Review Content</Label>
              <Textarea
                id="content"
                value={reviewFormData.content}
                onChange={(e) =>
                  setReviewFormData({
                    ...reviewFormData,
                    content: e.target.value,
                  })
                }
                className="mt-1"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rating">Rating (1-5)</Label>
                <Select
                  value={reviewFormData.rating.toString()}
                  onValueChange={(value) =>
                    setReviewFormData({
                      ...reviewFormData,
                      rating: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Star</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  value={reviewFormData.userId}
                  onChange={(e) =>
                    setReviewFormData({
                      ...reviewFormData,
                      userId: e.target.value,
                    })
                  }
                  className="mt-1"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="itemId">Product ID</Label>
              <Input
                id="itemId"
                value={reviewFormData.itemId}
                onChange={(e) =>
                  setReviewFormData({
                    ...reviewFormData,
                    itemId: e.target.value,
                  })
                }
                className="mt-1"
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsReviewDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {currentReview ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* FAQ Dialog */}
      <Dialog open={isFaqDialogOpen} onOpenChange={setIsFaqDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentFaq ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFaqSubmit} className="space-y-4">
            <div>
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                value={faqFormData.question}
                onChange={(e) =>
                  setFaqFormData({
                    ...faqFormData,
                    question: e.target.value,
                  })
                }
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="answer">Answer</Label>
              <Textarea
                id="answer"
                value={faqFormData.answer}
                onChange={(e) =>
                  setFaqFormData({
                    ...faqFormData,
                    answer: e.target.value,
                  })
                }
                className="mt-1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isPublished"
                checked={faqFormData.isPublished}
                onCheckedChange={(checked) =>
                  setFaqFormData({
                    ...faqFormData,
                    isPublished: checked,
                  })
                }
              />
              <Label htmlFor="isPublished">Published</Label>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFaqDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">{currentFaq ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
