"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

// Create a component that uses useSearchParams
function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams ? searchParams.get("error") : null;

  // Display appropriate error message based on parameter
  return (
    <Alert variant="destructive" className="max-w-md mx-auto mt-10">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Authentication Error</AlertTitle>
      <AlertDescription>
        {error === "OAuthAccountNotLinked"
          ? "This email is already associated with another account. Please sign in using the original provider."
          : "An error occurred during authentication. Please try again."}
      </AlertDescription>
    </Alert>
  );
}

// Main page component with Suspense boundary
export default function LoginErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto mt-10">Loading error details...</div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
