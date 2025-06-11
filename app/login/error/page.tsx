"use client";

import React, { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

// Create a component that uses useSearchParams
function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams ? searchParams.get("error") : null;
  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "Il y a un problème de configuration du serveur d'authentification.";
      case "AccessDenied":
        return "Accès refusé. L&apos;application n&apos;est pas autorisée par le fournisseur OAuth. Veuillez contacter l&apos;administrateur.";
      case "Verification":
        return "Le lien de vérification est invalide ou a expiré.";
      case "OAuthSignin":
        return "Erreur lors de la connexion OAuth.";
      case "OAuthCallback":
        return "Erreur dans la réponse OAuth (callback). Vérifiez les URLs de redirection.";
      case "OAuthCreateAccount":
        return "Impossible de créer le compte OAuth.";
      case "EmailCreateAccount":
        return "Impossible de créer le compte avec cette adresse email.";
      case "Callback":
        return "Erreur dans l'URL de callback.";
      case "OAuthAccountNotLinked":
        return "Cette adresse email est déjà associée à un autre compte. Veuillez vous connecter avec votre méthode habituelle.";
      case "EmailSignin":
        return "Impossible d'envoyer l'email de connexion.";
      case "CredentialsSignin":
        return "Email ou mot de passe incorrect.";
      case "SessionRequired":
        return "Vous devez être connecté pour accéder à cette page.";
      default:
        return `Erreur d'authentification: ${error || "inconnue"}`;
    }
  };
  // Log error for debugging (côté client seulement)
  useEffect(() => {
    console.error("Auth Error Details:", {
      error,
      url: typeof window !== 'undefined' ? window.location.href : 'server-side',
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  // Display appropriate error message based on parameter
  return (
    <div className="max-w-md mx-auto mt-10 space-y-4">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erreur d&apos;Authentification</AlertTitle>
        <AlertDescription>{getErrorMessage(error)}</AlertDescription>
      </Alert>

      {/* Debug info for development */}
      {process.env.NODE_ENV === "development" && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTitle className="text-yellow-800">Debug Info</AlertTitle>
          <AlertDescription className="text-yellow-700">
            <div className="text-sm font-mono">
              <div>Error code: {error || "null"}</div>
              <div>URL: {typeof window !== 'undefined' ? window.location.href : 'server-side'}</div>
              <div>Timestamp: {new Date().toISOString()}</div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="text-center space-y-2">
        <a
          href="/login"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retourner à la connexion
        </a>
      </div>
    </div>
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
