"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Content component that uses useSearchParams
function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams ? searchParams.get("orderId") : null;
  // Always treat order as successful
  const success = true;

  return (
    <div className="container max-w-xl mx-auto py-12">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-center space-x-2">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl mt-4">
            Order Confirmed!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">
            Thank you for your purchase! Your order has been confirmed and is
            now being processed.
          </p>
          {orderId && (
            <p className="font-medium mb-6">
              Order Reference: <span className="font-bold">{orderId}</span>
            </p>
          )}
          <p className="text-sm text-muted-foreground mb-6">
            A confirmation email has been sent to your registered email address
            with the order details.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/profile?tab=orders">View My Orders</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main order confirmation page with Suspense boundary
export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="container max-w-xl mx-auto py-12 text-center">
          Loading order confirmation...
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
