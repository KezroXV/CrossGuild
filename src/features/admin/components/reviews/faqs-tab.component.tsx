"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Switch } from "@/shared/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  ReviewPagination,
  ReviewSearch,
} from "@/features/admin/components/reviews/review-filters.component";
import {
  deleteAdminFaq,
  fetchAdminFaqs,
  updateAdminFaq,
} from "@/features/admin/services/admin.service";
import type { AdminFAQ, AdminFaqFormInput } from "@/features/admin/types/admin.type";

export default function FaqsTab() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState("10");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentFaq, setCurrentFaq] = useState<AdminFAQ | null>(null);
  const [formData, setFormData] = useState<AdminFaqFormInput>({
    question: "",
    answer: "",
    isPublished: false,
  });

  const pageSizeNum = parseInt(pageSize, 10);

  const faqsQuery = useQuery({
    queryKey: ["admin", "faqs", currentPage, pageSizeNum, search],
    queryFn: () =>
      fetchAdminFaqs({ page: currentPage, pageSize: pageSizeNum, search }),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "faqs"] });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminFaq,
    onSuccess: () => {
      toast.success("FAQ deleted successfully");
      invalidate();
    },
    onError: () => toast.error("Failed to delete FAQ"),
  });

  const updateMutation = useMutation({
    mutationFn: () => updateAdminFaq(currentFaq!.id, formData),
    onSuccess: () => {
      toast.success("FAQ updated successfully");
      setIsDialogOpen(false);
      invalidate();
    },
    onError: () => toast.error("Failed to update FAQ"),
  });

  const faqs = faqsQuery.data?.faqs ?? [];
  const totalPages = faqsQuery.data?.totalPages ?? 1;

  const openCreateDialog = () => {
    setCurrentFaq(null);
    setFormData({ question: "", answer: "", isPublished: false });
    setIsDialogOpen(true);
  };

  const openEditDialog = (faq: AdminFAQ) => {
    setCurrentFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer || "",
      isPublished: faq.isPublished,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentFaq) updateMutation.mutate();
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={openCreateDialog} size="lg">
          Add FAQ
        </Button>
      </div>

      {faqsQuery.isLoading && (
        <p className="text-blue-500 mb-6">Loading FAQs...</p>
      )}

      <ReviewSearch
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setCurrentPage(1);
        }}
        placeholder="Search FAQs..."
      />

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
                      onClick={() => openEditDialog(faq)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMutation.mutate(faq.id)}
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
                      Created: {new Date(faq.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-medium ${
                          faq.isPublished ? "text-green-600" : "text-amber-600"
                        }`}
                      >
                        {faq.isPublished ? "Published" : "Draft"}
                      </span>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          faq.isPublished ? "bg-green-500" : "bg-amber-500"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          !faqsQuery.isLoading && (
            <div className="text-center py-10 text-muted-foreground">
              No FAQs found
            </div>
          )
        )}
      </div>

      <ReviewPagination
        pageSize={pageSize}
        onPageSizeChange={(value) => {
          setPageSize(value);
          setCurrentPage(1);
        }}
        currentPage={currentPage}
        totalPages={totalPages}
        onPreviousPage={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        onNextPage={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentFaq ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                value={formData.question}
                onChange={(e) =>
                  setFormData({ ...formData, question: e.target.value })
                }
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="answer">Answer</Label>
              <Textarea
                id="answer"
                value={formData.answer}
                onChange={(e) =>
                  setFormData({ ...formData, answer: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isPublished"
                checked={formData.isPublished}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isPublished: checked })
                }
              />
              <Label htmlFor="isPublished">Published</Label>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!currentFaq || updateMutation.isPending}>
                {currentFaq ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
