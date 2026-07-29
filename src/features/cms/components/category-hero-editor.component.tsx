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
import { useCategoryHero } from "@/features/cms/hooks/use-category-hero.hook";
import type { CategoryHeroContent } from "@/features/cms/types/cms.type";

const emptyCategoryHero: CategoryHeroContent = {
  id: "",
  heading: "",
  highlightedText: "",
  description: "",
  buttonText: "",
  backgroundImage: "",
};

export default function CategoryHeroEditor() {
  const { categoryHeroContent, isLoading, isSubmitting, updateCategoryHero } =
    useCategoryHero();
  const [content, setContent] = useState<CategoryHeroContent>(emptyCategoryHero);

  useEffect(() => {
    if (categoryHeroContent) setContent(categoryHeroContent);
  }, [categoryHeroContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("heading", content.heading);
    formData.append("highlightedText", content.highlightedText);
    formData.append("description", content.description);
    formData.append("buttonText", content.buttonText);

    const fileInput = document.getElementById(
      "categoryHeroBackgroundImage"
    ) as HTMLInputElement;
    if (fileInput?.files?.length) {
      formData.append("backgroundImage", fileInput.files[0]);
    }

    await updateCategoryHero(formData);
  };

  const update = (field: keyof CategoryHeroContent, value: string) => {
    setContent((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Edit Category Hero Section</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="categoryHeading">Heading</Label>
                  <Input
                    id="categoryHeading"
                    value={content.heading}
                    onChange={(e) => update("heading", e.target.value)}
                    placeholder="Discover the Ultimate"
                  />
                </div>
                <div>
                  <Label htmlFor="categoryHighlightedText">
                    Highlighted Text
                  </Label>
                  <Input
                    id="categoryHighlightedText"
                    value={content.highlightedText}
                    onChange={(e) => update("highlightedText", e.target.value)}
                    placeholder="Gaming Gear"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="categoryDescription">Description</Label>
                <Textarea
                  id="categoryDescription"
                  value={content.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Explore top-tier gaming accessories..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="categoryButtonText">Button Text</Label>
                  <Input
                    id="categoryButtonText"
                    value={content.buttonText}
                    onChange={(e) => update("buttonText", e.target.value)}
                    placeholder="Explore Categories"
                  />
                </div>
              </div>

              <Separator className="my-4" />

              <div>
                <Label htmlFor="categoryHeroBackgroundImage">
                  Background Image
                </Label>
                <div className="mt-2">
                  <Input
                    id="categoryHeroBackgroundImage"
                    type="file"
                    accept="image/*"
                  />
                </div>
                {content.backgroundImage && (
                  <div className="mt-4 relative h-48 w-full overflow-hidden rounded-lg border">
                    <Image
                      src={content.backgroundImage}
                      alt="Current category hero background"
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
                "Update Category Hero"
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
