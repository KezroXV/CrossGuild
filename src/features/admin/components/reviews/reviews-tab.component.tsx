"use client";

import {
  ReviewPagination,
  ReviewSearch,
} from "@/features/admin/components/reviews/review-filters.component";
import ReviewsTable from "@/features/admin/components/reviews/reviews-table.component";
import { ReviewFormDialog } from "@/features/admin/components/reviews/review-moderation-actions.component";
import { useAdminReviews } from "@/features/admin/hooks/use-admin-reviews.hook";

export default function ReviewsTab() {
  const {
    reviews,
    isLoading,
    search,
    onSearchChange,
    currentPage,
    totalPages,
    pageSize,
    onPageSizeChange,
    onPreviousPage,
    onNextPage,
    deleteReview,
    isDialogOpen,
    setIsDialogOpen,
    currentReview,
    formData,
    setFormData,
    submitReview,
    isSaving,
  } = useAdminReviews();

  return (
    <>
      {isLoading && (
        <p className="text-blue-500 mb-6">Loading reviews...</p>
      )}

      <ReviewSearch search={search} onSearchChange={onSearchChange} />

      <ReviewsTable reviews={reviews} onDelete={deleteReview} />

      <ReviewPagination
        pageSize={pageSize}
        onPageSizeChange={onPageSizeChange}
        currentPage={currentPage}
        totalPages={totalPages}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
      />

      <ReviewFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        isEditing={!!currentReview}
        formData={formData}
        onFormChange={setFormData}
        onSubmit={() => submitReview()}
        isSaving={isSaving}
      />
    </>
  );
}
