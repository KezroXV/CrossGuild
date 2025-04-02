"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

// Content component that uses useSearchParams
function VerifyErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams ? searchParams.get("error") : null;

  return (
    <Alert variant="destructive" className="max-w-md mx-auto mt-10">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Verification Error</AlertTitle>
      <AlertDescription>
        {error === "TokenExpired"
          ? "The verification link has expired. Please request a new verification email."
          : error === "InvalidToken"
          ? "The verification link is invalid. Please check the link or request a new one."
          : "An error occurred during email verification. Please try again."}
      </AlertDescription>
    </Alert>
  );
}

// Main page component with Suspense boundary
export default function VerifyErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto mt-10">Loading error details...</div>
      }
    >
      <VerifyErrorContent />
    </Suspense>
  );
}
