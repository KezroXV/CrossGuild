"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface CheckoutButtonProps {
  subtotal: number;
  isSubmitting: boolean;
  isDisabled: boolean;
}

export function CheckoutButton({
  subtotal,
  isSubmitting,
  isDisabled,
}: CheckoutButtonProps) {
  return (
    <div className="pt-4 border-t">
      <div className="flex justify-between mb-4">
        <span className="text-lg font-semibold">Total:</span>
        <span className="text-lg font-bold">{subtotal.toFixed(2)} €</span>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || isDisabled}
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90 transition-colors dark:bg-accent dark:text-accent-foreground dark:hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        size="lg"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            Processing...
          </>
        ) : (
          <>
            Complete Order <ArrowRight size={16} />
          </>
        )}
      </Button>
    </div>
  );
}
