"use client";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { AdminReviewFormInput } from "@/features/admin/types/admin.type";

interface ReviewModerationActionsProps {
  reviewId: string;
  onDelete: (id: string) => void;
}

export function ReviewRowActions({
  reviewId,
  onDelete,
}: ReviewModerationActionsProps) {
  return (
    <Button variant="destructive" size="sm" onClick={() => onDelete(reviewId)}>
      Delete
    </Button>
  );
}

interface ReviewFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  formData: AdminReviewFormInput;
  onFormChange: (data: AdminReviewFormInput) => void;
  onSubmit: () => void;
  isSaving?: boolean;
}

export function ReviewFormDialog({
  open,
  onOpenChange,
  isEditing,
  formData,
  onFormChange,
  onSubmit,
  isSaving,
}: ReviewFormDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Review" : "Add Review"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="content">Review Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) =>
                onFormChange({ ...formData, content: e.target.value })
              }
              className="mt-1"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rating">Rating (1-5)</Label>
              <Select
                value={formData.rating.toString()}
                onValueChange={(value) =>
                  onFormChange({ ...formData, rating: parseInt(value, 10) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} Star{n > 1 ? "s" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                value={formData.userId}
                onChange={(e) =>
                  onFormChange({ ...formData, userId: e.target.value })
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
              value={formData.itemId}
              onChange={(e) =>
                onFormChange({ ...formData, itemId: e.target.value })
              }
              className="mt-1"
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isEditing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
