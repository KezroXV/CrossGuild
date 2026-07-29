"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { RegisterInput } from "@/features/auth/validations/auth.schema";
import {
  registerUser,
  uploadProfileImage,
} from "@/features/auth/services/auth.service";

export type RegisterFormValues = RegisterInput & {
  confirmPassword: string;
  profileImage?: File | null;
};

export function useAuth(callbackUrl?: string | null) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectAfterAuth = () => {
    router.push(callbackUrl || "/");
    router.refresh();
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        redirectAfterAuth();
      }
    } catch {
      setError("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (values: RegisterFormValues) => {
    setIsLoading(true);
    setError("");

    if (values.password !== values.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (values.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      let imageUrl = values.image ?? "";

      if (values.profileImage) {
        imageUrl = await uploadProfileImage(values.profileImage);
      }

      const userData: RegisterInput = {
        name: values.name,
        email: values.email,
        password: values.password,
        image: imageUrl || undefined,
        phone: values.phone,
        address: values.address,
        city: values.city,
        postalCode: values.postalCode,
        country: values.country,
      };

      await registerUser(userData);

      await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      redirectAfterAuth();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred during registration");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const socialLogin = (provider: string) => {
    setIsLoading(true);
    signIn(provider, { callbackUrl: callbackUrl || "/" });
  };

  return {
    isLoading,
    error,
    setError,
    login,
    register,
    socialLogin,
  };
}
