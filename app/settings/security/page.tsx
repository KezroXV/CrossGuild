"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Laptop, Smartphone, Lock, Globe, X } from "lucide-react";
import Link from "next/link";

type Session = {
  id: string;
  sessionToken: string;
  userId: string;
  expires: string;
  userAgent?: string;
  lastActive?: string;
  ip?: string;
};

export default function SecuritySettings() {
  const { data: session } = useSession();
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch("/api/user/sessions");
        if (!response.ok) throw new Error("Failed to fetch sessions");

        const data = await response.json();
        setActiveSessions(data.sessions);
      } catch (error) {
        setError("Could not load active sessions");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchSessions();
    }
  }, [session]);

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/user/sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to revoke session");

      // Remove the session from the list
      setActiveSessions((sessions) =>
        sessions.filter((session) => session.id !== sessionId)
      );
    } catch (error) {
      setError("Failed to revoke session");
      console.error(error);
    }
  };

  // Get icon based on user agent
  const getDeviceIcon = (userAgent?: string) => {
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
  };

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

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {activeSessions.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  No active sessions found
                </p>
              ) : (
                activeSessions.map((s) => (
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
                          {new Date(s.lastActive || s.expires).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {s.ip || "Unknown location"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRevokeSession(s.id)}
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
