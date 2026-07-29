"use client";

import { Button } from "@/shared/components/ui/button";

type ReportEmptyStateProps = {
  message?: string;
  onRefresh?: () => void;
};

export default function ReportEmptyState({
  message = "No data available",
  onRefresh,
}: ReportEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64 border rounded-md">
      <p className="text-muted-foreground">{message}</p>
      {onRefresh && (
        <Button variant="outline" className="mt-4" onClick={onRefresh}>
          Refresh Data
        </Button>
      )}
    </div>
  );
}
