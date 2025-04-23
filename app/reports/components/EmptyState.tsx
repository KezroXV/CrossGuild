import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  message?: string;
}

export default function EmptyState({
  message = "No data available",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64 border rounded-md">
      <p className="text-muted-foreground">{message}</p>
      <Button variant="outline" className="mt-4">
        Refresh Data
      </Button>
    </div>
  );
}
