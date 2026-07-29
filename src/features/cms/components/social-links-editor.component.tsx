"use client";

import { useEffect, useState } from "react";
import {
  Facebook,
  Instagram,
  Linkedin,
  Loader2,
  Twitter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useSocialLinks } from "@/features/cms/hooks/use-social-links.hook";
import type { SocialLinks } from "@/features/cms/types/cms.type";

const emptySocialLinks: SocialLinks = {
  id: "",
  facebook: "",
  twitter: "",
  instagram: "",
  linkedin: "",
};

export default function SocialLinksEditor() {
  const { socialLinks, isLoading, isSubmitting, updateSocialLinks } =
    useSocialLinks();
  const [form, setForm] = useState<SocialLinks>(emptySocialLinks);

  useEffect(() => {
    if (socialLinks) setForm(socialLinks);
  }, [socialLinks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSocialLinks(form);
  };

  const update = (field: keyof SocialLinks, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Edit Social Media Links</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4">
              <SocialLinkField
                icon={<Facebook className="h-5 w-5 text-blue-600" />}
                id="facebook"
                label="Facebook URL"
                value={form.facebook}
                onChange={(v) => update("facebook", v)}
                placeholder="https://facebook.com/crossguild"
              />
              <SocialLinkField
                icon={<Twitter className="h-5 w-5 text-blue-400" />}
                id="twitter"
                label="Twitter/X URL"
                value={form.twitter}
                onChange={(v) => update("twitter", v)}
                placeholder="https://twitter.com/crossguild"
              />
              <SocialLinkField
                icon={<Instagram className="h-5 w-5 text-pink-600" />}
                id="instagram"
                label="Instagram URL"
                value={form.instagram}
                onChange={(v) => update("instagram", v)}
                placeholder="https://instagram.com/crossguild"
              />
              <SocialLinkField
                icon={<Linkedin className="h-5 w-5 text-blue-700" />}
                id="linkedin"
                label="LinkedIn URL"
                value={form.linkedin}
                onChange={(v) => update("linkedin", v)}
                placeholder="https://linkedin.com/company/crossguild"
              />
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Social Links"
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function SocialLinkField({
  icon,
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  icon: React.ReactNode;
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex items-center gap-4">
      {icon}
      <div className="flex-1">
        <Label htmlFor={id}>{label}</Label>
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          type="url"
        />
      </div>
    </div>
  );
}
