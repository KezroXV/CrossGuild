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
  const success = searchParams ? searchParams.get("success") === "true" : false;

  return (
    <div className="container max-w-xl mx-auto py-12">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-center space-x-2">
            {success ? (
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600" />
              </div>
            ) : (
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-red-600"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </div>
            )}
          </div>
          <CardTitle className="text-center text-2xl mt-4">
            {success ? "Order Confirmed!" : "Order Processing Issue"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {success ? (
            <>
              <p className="mb-4">
                Thank you for your purchase! Your order has been confirmed and
                is now being processed.
              </p>
              {orderId && (
                <p className="font-medium mb-6">
                  Order Reference: <span className="font-bold">{orderId}</span>
                </p>
              )}
              <p className="text-sm text-muted-foreground mb-6">
                A confirmation email has been sent to your registered email
                address with the order details.
              </p>
            </>
          ) : (
            <>
              <p className="mb-4">
                There was an issue processing your order. No payment has been
                taken.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Please try again or contact customer support if the problem
                persists.
              </p>
            </>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
            {success && (
              <Button variant="outline" asChild>
                <Link href="/account/orders">View My Orders</Link>
              </Button>
            )}
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
