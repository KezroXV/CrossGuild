"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  let errorMessage = "An unknown error occurred";

  // Customize error messages
  if (error === "CredentialsSignin") {
    errorMessage = "Invalid credentials provided";
  } else if (error === "AccessDenied") {
    errorMessage = "Access denied. You don't have the necessary permissions";
  } else if (error === "OAuthAccountNotLinked") {
    errorMessage =
      "This email is already associated with another account. Please sign in with the method you used previously";
  } else if (error === "OAuthSignInError") {
    errorMessage = "Error during authentication with provider";
  } else if (error === "OAuthCallbackError") {
    errorMessage = "Callback error with authentication provider";
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-red-600">
            Authentication Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center">{errorMessage}</p>
          <div className="flex justify-center">
            <Button asChild className="mt-4">
              <Link href="/login">Return to Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
