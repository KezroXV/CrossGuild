"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { XCircle } from "lucide-react";
import Link from "next/link";

export default function VerifyError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  let errorMessage = "There was a problem verifying your email";

  if (error === "invalid-token") {
    errorMessage = "The verification link is invalid";
  } else if (error === "expired-token") {
    errorMessage = "The verification link has expired";
  } else if (error === "user-not-found") {
    errorMessage =
      "We couldn't find a user associated with this verification link";
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Verification Failed
          </CardTitle>
          <CardDescription>{errorMessage}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center space-y-4 flex-col">
          <Button asChild>
            <Link href="/login">Return to Login</Link>
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Need a new verification link?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>{" "}
              to request one.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
