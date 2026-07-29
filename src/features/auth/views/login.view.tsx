"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { LoginForm } from "@/features/auth/forms/login-form.component";
import { RegisterForm } from "@/features/auth/forms/register-form.component";
import { OAuthButtons } from "@/features/auth/forms/oauth-buttons.component";
import { useAuth } from "@/features/auth/hooks/use-auth.hook";

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams ? searchParams.get("callbackUrl") : null;
  const { isLoading, error, setError, login, register, socialLogin } =
    useAuth(callbackUrl);

  return (
    <div className="flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Welcome To CrossGuild
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <LoginForm
                isLoading={isLoading}
                onSubmit={(email, password) => login(email, password)}
              />
            </TabsContent>

            <TabsContent value="register">
              <RegisterForm
                isLoading={isLoading}
                onSubmit={register}
                onValidationError={setError}
              />
            </TabsContent>
          </Tabs>

          <OAuthButtons
            isLoading={isLoading}
            onSocialLogin={socialLogin}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginView() {
  return (
    <Suspense
      fallback={<div className="text-center">Loading login form...</div>}
    >
      <LoginContent />
    </Suspense>
  );
}
