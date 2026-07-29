"use client";

import { Heart } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useWishlistItem } from "@/features/wishlist/hooks/use-wishlist.hook";

interface AddToWishlistButtonProps {
  itemId: string;
  itemName?: string;
  className?: string;
  iconClassName?: string;
  variant?: "card" | "detail";
  onClick?: (e: React.MouseEvent) => void;
}

export function AddToWishlistButton({
  itemId,
  itemName,
  className,
  iconClassName,
  variant = "card",
  onClick,
}: AddToWishlistButtonProps) {
  const { isInWishlist, isToggling, toggle } = useWishlistItem(
    itemId,
    itemName
  );

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onClick?.(e);
    toggle();
  };

  const label = isInWishlist ? "Remove from wishlist" : "Add to wishlist";

  if (variant === "detail") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isToggling}
        className={cn(
          "p-2 rounded-full transition-colors",
          isInWishlist
            ? "text-accent hover:bg-accent/10"
            : "text-muted-foreground hover:text-accent hover:bg-accent/10",
          className
        )}
        aria-label={label}
        title={label}
      >
        <Heart
          className={cn(
            "h-6 w-6",
            isToggling
              ? "animate-pulse text-accent"
              : isInWishlist
                ? "text-accent fill-accent"
                : "hover:text-accent",
            iconClassName
          )}
          fill={isInWishlist ? "currentColor" : "none"}
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isToggling}
      className={cn(
        "absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors dark:bg-background dark:hover:bg-muted",
        className
      )}
      aria-label={label}
      title={label}
    >
      <Heart
        className={cn(
          "h-5 w-5",
          isToggling
            ? "animate-pulse text-accent"
            : isInWishlist
              ? "text-accent fill-accent"
              : "text-gray-400 hover:text-accent",
          iconClassName
        )}
        fill={isInWishlist ? "currentColor" : "none"}
      />
    </button>
  );
}
