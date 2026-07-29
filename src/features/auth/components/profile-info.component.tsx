"use client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { ProfileImageUpload } from "@/features/auth/components/profile-image-upload.component";
import type { UseFormReturn } from "react-hook-form";
import type { PersonalInfoInput } from "@/features/auth/validations/profile.schema";

type ProfileInfoProps = {
  form: UseFormReturn<PersonalInfoInput>;
  currentImage?: string | null;
  imagePreview: string | null;
  hasNewImage: boolean;
  isUploading: boolean;
  isUpdating: boolean;
  onImageChange: (file: File | null) => void;
  onSubmit: (values: PersonalInfoInput) => void;
};

export function ProfileInfo({
  form,
  currentImage,
  imagePreview,
  hasNewImage,
  isUploading,
  isUpdating,
  onImageChange,
  onSubmit,
}: ProfileInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Update your profile information and photo here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <ProfileImageUpload
              currentImage={currentImage}
              imagePreview={imagePreview}
              hasNewImage={hasNewImage}
              isUploading={isUploading}
              onImageChange={onImageChange}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="your@email.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    Changing your email might require verification.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Your phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Your city" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isUploading || isUpdating}>
              {isUploading || isUpdating ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
