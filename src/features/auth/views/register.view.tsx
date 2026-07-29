"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { RegisterForm } from "@/features/auth/forms/register-form.component";
import { useAuth } from "@/features/auth/hooks/use-auth.hook";

export default function RegisterView() {
  const { isLoading, error, setError, register } = useAuth();

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Inscription
        </CardTitle>
        <CardDescription className="text-center">
          Créez votre compte CrossGuild
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <RegisterForm
          variant="basic"
          isLoading={isLoading}
          onSubmit={register}
          onValidationError={setError}
          submitLabel="S'inscrire"
          loadingLabel="Inscription en cours..."
        />
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Se connecter
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
