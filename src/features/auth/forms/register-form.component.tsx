"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import type { RegisterFormValues } from "@/features/auth/hooks/use-auth.hook";

type RegisterFormProps = {
  isLoading: boolean;
  onSubmit: (values: RegisterFormValues) => void;
  onValidationError: (message: string) => void;
  variant?: "full" | "basic";
  submitLabel?: string;
  loadingLabel?: string;
};

export function RegisterForm({
  isLoading,
  onSubmit,
  onValidationError,
  variant = "full",
  submitLabel = "Register",
  loadingLabel = "Registering...",
}: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      onValidationError("Image file is too large. Maximum size is 5MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      onValidationError("Selected file is not an image");
      return;
    }

    setProfileImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      name,
      email,
      password,
      confirmPassword,
      profileImage: variant === "full" ? profileImage : null,
      phone: phone || undefined,
      address: address || undefined,
      city: city || undefined,
      postalCode: postalCode || undefined,
      country: country || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-email">Email</Label>
        <Input
          id="register-email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-password">Password</Label>
        <Input
          id="register-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <Input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      {variant === "full" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="profile-image">Profile Image</Label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1"
              >
                Choose File
              </Button>
              <input
                ref={fileInputRef}
                id="profile-image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {previewUrl && (
                <div className="relative h-12 w-12 overflow-hidden rounded-full">
                  <Image
                    src={previewUrl}
                    alt="Profile preview"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Max size: 5MB. Supported formats: JPG, PNG, GIF
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="shipping-info">
              <AccordionTrigger>
                Shipping Information (Optional)
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 mt-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone-number">Phone Number</Label>
                    <Input
                      id="phone-number"
                      type="tel"
                      placeholder="+1 123 456 7890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      type="text"
                      placeholder="123 Main Street"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        type="text"
                        placeholder="New York"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postal-code">Postal Code</Label>
                      <Input
                        id="postal-code"
                        type="text"
                        placeholder="10001"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      type="text"
                      placeholder="United States"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? loadingLabel : submitLabel}
      </Button>
    </form>
  );
}
