"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Token = {
  id: string;
  email: string;
  expires: string;
  createdAt: string;
  token: string;
  resetUrl: string;
};

export default function DevPasswordTokensPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const response = await fetch("/api/dev/password-reset-tokens");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch tokens");
        }

        setTokens(data.tokens);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  if (loading) {
    return (
      <div className="container max-w-4xl py-10">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">
              Loading Password Reset Tokens...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center p-4">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl py-10">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-10">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">
            Development Password Reset Tokens
          </CardTitle>
          <CardDescription>
            This page is only available in development mode. It shows all active
            password reset tokens.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tokens.length === 0 ? (
            <p className="text-center py-4">
              No active password reset tokens found.
            </p>
          ) : (
            <div className="space-y-4">
              {tokens.map((token) => (
                <Card key={token.id} className="border border-neutral-200">
                  <CardContent className="p-4">
                    <div className="grid gap-2">
                      <div>
                        <span className="font-medium">Email:</span>{" "}
                        {token.email}
                      </div>
                      <div>
                        <span className="font-medium">Created:</span>{" "}
                        {formatDate(token.createdAt)}
                      </div>
                      <div>
                        <span className="font-medium">Expires:</span>{" "}
                        {formatDate(token.expires)}
                      </div>
                      <div className="flex flex-col gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(token.resetUrl)}
                          className="w-full sm:w-auto"
                        >
                          Copy Reset URL
                        </Button>
                        <Button asChild className="w-full sm:w-auto">
                          <Link href={token.resetUrl}>Go to Reset Page</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 text-center">
        <Button asChild variant="outline">
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  );
}
