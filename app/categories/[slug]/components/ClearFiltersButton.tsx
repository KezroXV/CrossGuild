"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ClearFiltersButtonProps {
  className?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
}

export default function ClearFiltersButton({
  className,
  variant = "link",
}: ClearFiltersButtonProps) {
  const router = useRouter();

  return (
    <Button
      variant={variant}
      className={className}
      onClick={() => {
        router.push(window.location.pathname);
      }}
    >
      Clear all filters
    </Button>
  );
}
