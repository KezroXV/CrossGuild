"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  changePassword,
  updateProfile,
  uploadProfileImage,
} from "@/features/auth/services/profile.service";
import {
  passwordChangeSchema,
  personalInfoSchema,
  type PasswordChangeInput,
  type PersonalInfoInput,
} from "@/features/auth/validations/profile.schema";

type SessionUserWithCity = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  city?: string | null;
};

export function useProfile() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const personalInfoForm = useForm<PersonalInfoInput>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: { name: "", email: "", phone: "", city: "" },
  });

  const passwordChangeForm = useForm<PasswordChangeInput>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (!session?.user) return;

    const user = session.user as SessionUserWithCity;
    personalInfoForm.reset({
      name: user.name || "",
      email: user.email || "",
      phone: "",
      city: user.city || "",
    });
  }, [session, personalInfoForm]);

  const handleImageChange = (file: File | null) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image is too large. Max size: 5MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Selected file is not an image");
      return;
    }

    setImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (values: PersonalInfoInput) => {
      await updateProfile(values);

      if (image) {
        setIsUploading(true);
        const result = await uploadProfileImage(image);
        return { values, imageUrl: result.imageUrl };
      }

      return { values, imageUrl: null as string | null };
    },
    onSuccess: async ({ values, imageUrl }) => {
      personalInfoForm.reset({
        name: values.name,
        email: values.email,
        phone: values.phone || "",
        city: values.city || "",
      });

      const sessionUpdate: SessionUserWithCity = {
        ...session?.user,
        name: values.name,
        email: values.email,
        city: values.city,
      };

      if (imageUrl) {
        sessionUpdate.image = imageUrl;
        setImagePreview(imageUrl);
      }

      await updateSession({ ...session, user: sessionUpdate });

      if (values.city) {
        sessionStorage.setItem("userCity", values.city);
      }

      setImage(null);
      if (!imageUrl) setImagePreview(null);
      setIsUploading(false);
      toast.success("Your information has been updated");
    },
    onError: () => {
      setIsUploading(false);
      toast.error("Failed to update your information");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (values: PasswordChangeInput) =>
      changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }),
    onSuccess: () => {
      toast.success("Your password has been updated");
      passwordChangeForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: () => {
      toast.error(
        "Failed to change your password. Please check your current password."
      );
    },
  });

  return {
    session,
    status,
    personalInfoForm,
    passwordChangeForm,
    image,
    imagePreview,
    isUploading,
    isUpdating: updateProfileMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
    handleImageChange,
    clearImageSelection: () => {
      setImage(null);
      setImagePreview(null);
    },
    onPersonalInfoSubmit: (values: PersonalInfoInput) =>
      updateProfileMutation.mutate(values),
    onPasswordChangeSubmit: (values: PasswordChangeInput) =>
      changePasswordMutation.mutate(values),
  };
}
