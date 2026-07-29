"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Separator } from "@/shared/components/ui/separator";
import { useHero } from "@/features/cms/hooks/use-hero.hook";
import type { HeroContent } from "@/features/cms/types/cms.type";

const emptyHero: HeroContent = {
  id: "",
  tagline: "",
  heading: "",
  highlightedText: "",
  description: "",
  primaryButtonText: "",
  secondaryButtonText: "",
  backgroundImage: "",
};

export default function HeroEditor() {
  const { heroContent, isLoading, isSubmitting, updateHero } = useHero();
  const [content, setContent] = useState<HeroContent>(emptyHero);

  useEffect(() => {
    if (heroContent) setContent(heroContent);
  }, [heroContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("tagline", content.tagline);
    formData.append("heading", content.heading);
    formData.append("highlightedText", content.highlightedText);
    formData.append("description", content.description);
    formData.append("primaryButtonText", content.primaryButtonText);
    formData.append("secondaryButtonText", content.secondaryButtonText);

    const fileInput = document.getElementById(
      "heroBackgroundImage"
    ) as HTMLInputElement;
    if (fileInput?.files?.length) {
      formData.append("backgroundImage", fileInput.files[0]);
    }

    await updateHero(formData);
  };

  const update = (field: keyof HeroContent, value: string) => {
    setContent((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Edit Home Hero Section</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={content.tagline}
                  onChange={(e) => update("tagline", e.target.value)}
                  placeholder="Take Your Gaming to the Next Level"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="heading">Heading</Label>
                  <Input
                    id="heading"
                    value={content.heading}
                    onChange={(e) => update("heading", e.target.value)}
                    placeholder="High-Performance Gaming"
                  />
                </div>
                <div>
                  <Label htmlFor="highlightedText">Highlighted Text</Label>
                  <Input
                    id="highlightedText"
                    value={content.highlightedText}
                    onChange={(e) => update("highlightedText", e.target.value)}
                    placeholder="Accessories"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={content.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Equip yourself with high-performance gear..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryButtonText">Primary Button Text</Label>
                  <Input
                    id="primaryButtonText"
                    value={content.primaryButtonText}
                    onChange={(e) => update("primaryButtonText", e.target.value)}
                    placeholder="Shop Now"
                  />
                </div>
                <div>
                  <Label htmlFor="secondaryButtonText">
                    Secondary Button Text
                  </Label>
                  <Input
                    id="secondaryButtonText"
                    value={content.secondaryButtonText}
                    onChange={(e) =>
                      update("secondaryButtonText", e.target.value)
                    }
                    placeholder="New Arrivals!"
                  />
                </div>
              </div>

              <Separator className="my-4" />

              <div>
                <Label htmlFor="heroBackgroundImage">Background Image</Label>
                <div className="mt-2">
                  <Input
                    id="heroBackgroundImage"
                    type="file"
                    accept="image/*"
                  />
                </div>
                {content.backgroundImage && (
                  <div className="mt-4 relative h-48 w-full overflow-hidden rounded-lg border">
                    <Image
                      src={content.backgroundImage}
                      alt="Current hero background"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Home Hero"
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
