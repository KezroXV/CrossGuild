"use client";

import { useRef } from "react";
import Image from "next/image";
import { Button } from "@/shared/components/ui/button";

type ProfileImageUploadProps = {
  currentImage?: string | null;
  imagePreview: string | null;
  hasNewImage: boolean;
  isUploading: boolean;
  onImageChange: (file: File | null) => void;
};

export function ProfileImageUpload({
  currentImage,
  imagePreview,
  hasNewImage,
  isUploading,
  onImageChange,
}: ProfileImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onImageChange(file);
  };

  return (
    <div className="flex flex-col items-center space-y-4 mb-6">
      <div className="relative h-24 w-24 rounded-full overflow-hidden border">
        <Image
          src={
            imagePreview || currentImage || "/images/default-avatar.svg"
          }
          alt="Avatar"
          width={96}
          height={96}
          className="h-full w-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== "/images/default-avatar.svg") {
              target.src = "/images/default-avatar.svg";
            }
          }}
        />
      </div>
      <div className="flex flex-col items-center space-y-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
        >
          Choose Image
        </Button>
        <input
          ref={fileInputRef}
          id="profile-image"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        {hasNewImage && (
          <p className="text-sm text-green-600">New image selected</p>
        )}
        {isUploading && (
          <p className="text-sm text-muted-foreground">Uploading...</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Max size: 5MB. Supported formats: JPG, PNG, GIF, WEBP
        </p>
      </div>
    </div>
  );
}
