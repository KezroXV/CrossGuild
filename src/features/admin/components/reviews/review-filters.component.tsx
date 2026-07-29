"use client";

import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

interface ReviewSearchProps {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
}

export function ReviewSearch({
  search,
  onSearchChange,
  placeholder = "Search reviews...",
}: ReviewSearchProps) {
  return (
    <div className="mb-6">
      <Input
        type="text"
        placeholder={placeholder}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full max-w-md"
      />
    </div>
  );
}

interface ReviewPaginationProps {
  pageSize: string;
  onPageSizeChange: (value: string) => void;
  currentPage: number;
  totalPages: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export function ReviewPagination({
  pageSize,
  onPageSizeChange,
  currentPage,
  totalPages,
  onPreviousPage,
  onNextPage,
}: ReviewPaginationProps) {
  return (
    <div className="flex justify-between items-center mt-8 pt-4 border-t">
      <Select value={pageSize} onValueChange={onPageSizeChange}>
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

      <div className="flex gap-3 items-center">
        <Button
          onClick={onPreviousPage}
          disabled={currentPage === 1}
          variant="outline"
          size="sm"
        >
          Previous
        </Button>
        <span className="px-3 py-1 bg-muted rounded-md text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          variant="outline"
          size="sm"
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default function ReviewFilters({
  search,
  onSearchChange,
  placeholder,
  pageSize,
  onPageSizeChange,
  currentPage,
  totalPages,
  onPreviousPage,
  onNextPage,
}: ReviewSearchProps & ReviewPaginationProps) {
  return (
    <>
      <ReviewSearch
        search={search}
        onSearchChange={onSearchChange}
        placeholder={placeholder}
      />
      <ReviewPagination
        pageSize={pageSize}
        onPageSizeChange={onPageSizeChange}
        currentPage={currentPage}
        totalPages={totalPages}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
      />
    </>
  );
}
