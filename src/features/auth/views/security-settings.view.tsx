"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Laptop, Smartphone, Lock, Globe, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import {
  fetchActiveSessions,
  revokeSession,
} from "@/features/auth/services/profile.service";
import type { ActiveSession } from "@/features/auth/types/profile.type";

const sessionKeys = {
  all: ["active-sessions"] as const,
};

function getDeviceIcon(userAgent?: string) {
  if (!userAgent) return <Globe className="h-5 w-5" />;

  const ua = userAgent.toLowerCase();
  if (
    ua.includes("mobile") ||
    ua.includes("android") ||
    ua.includes("iphone")
  ) {
    return <Smartphone className="h-5 w-5" />;
  }
  return <Laptop className="h-5 w-5" />;
}

export default function SecuritySettingsView() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const sessionsQuery = useQuery({
    queryKey: sessionKeys.all,
    queryFn: fetchActiveSessions,
    enabled: !!session,
  });

  const revokeMutation = useMutation({
    mutationFn: revokeSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.all });
    },
  });

  const activeSessions = sessionsQuery.data ?? [];
  const error =
    sessionsQuery.error instanceof Error
      ? sessionsQuery.error.message
      : revokeMutation.error instanceof Error
        ? revokeMutation.error.message
        : "";

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Security Settings</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            These are the devices currently logged in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {sessionsQuery.isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="space-y-4">
              {activeSessions.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  No active sessions found
                </p>
              ) : (
                activeSessions.map((s: ActiveSession) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-4 border rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      {getDeviceIcon(s.userAgent)}
                      <div>
                        <p className="font-medium">
                          {s.userAgent?.split("/")[0] || "Unknown Device"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Last active:{" "}
                          {new Date(
                            s.lastActive || s.expires
                          ).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {s.ip || "Unknown location"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => revokeMutation.mutate(s.id)}
                      disabled={revokeMutation.isPending}
                      aria-label="Revoke session"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Password
          </CardTitle>
          <CardDescription>
            Change your password or enable two-factor authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/password-reset">Change Password</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
