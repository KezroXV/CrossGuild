"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";

interface CartSummaryProps {
  subtotal: number;
}

export function CartSummary({ subtotal }: CartSummaryProps) {
  const router = useRouter();

  return (
    <div className="mt-6 border-t pt-4 dark:border-border">
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          className="border-2 border-primary text-primary hover:bg-primary/10 dark:border-primary dark:text-primary dark:hover:bg-primary/20 transition-colors"
          onClick={() => router.push("/")}
        >
          Continue Shopping
        </Button>
        <div className="text-right">
          <p className="text-2xl font-bold">Subtotal: {subtotal.toFixed(2)} €</p>
          <p className="text-sm text-muted-foreground">
            Taxes and shipping calculated at checkout
          </p>
        </div>
      </div>
    </div>
  );
}
