"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

interface HeroContent {
  id: string;
  tagline: string;
  heading: string;
  highlightedText: string;
  description: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  backgroundImage: string;
}

interface CategoryHeroContent {
  id: string;
  heading: string;
  highlightedText: string;
  description: string;
  buttonText: string;
  backgroundImage: string;
}

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState("hero-sections");

  const [heroContent, setHeroContent] = useState<HeroContent>({
    id: "",
    tagline: "",
    heading: "",
    highlightedText: "",
    description: "",
    primaryButtonText: "",
    secondaryButtonText: "",
    backgroundImage: "",
  });

  const [categoryHeroContent, setCategoryHeroContent] =
    useState<CategoryHeroContent>({
      id: "",
      heading: "",
      highlightedText: "",
      description: "",
      buttonText: "",
      backgroundImage: "",
    });

  const [loading, setLoading] = useState({
    heroFetch: false,
    categoryHeroFetch: false,
    heroSubmit: false,
    categoryHeroSubmit: false,
  });

  useEffect(() => {
    if (activeTab === "hero-sections") {
      fetchHeroContent();
      fetchCategoryHeroContent();
    }
  }, [activeTab]);

  const fetchHeroContent = async () => {
    setLoading((prev) => ({ ...prev, heroFetch: true }));
    try {
      const response = await fetch("/api/content/hero");
      if (response.ok) {
        const data = await response.json();
        setHeroContent(data);
      } else {
        toast.error("Failed to fetch hero content");
      }
    } catch (error) {
      console.error("Error fetching hero content:", error);
      toast.error("An error occurred while fetching hero content");
    } finally {
      setLoading((prev) => ({ ...prev, heroFetch: false }));
    }
  };

  const fetchCategoryHeroContent = async () => {
    setLoading((prev) => ({ ...prev, categoryHeroFetch: true }));
    try {
      const response = await fetch("/api/content/category-hero");
      if (response.ok) {
        const data = await response.json();
        setCategoryHeroContent(data);
      } else {
        toast.error("Failed to fetch category hero content");
      }
    } catch (error) {
      console.error("Error fetching category hero content:", error);
      toast.error("An error occurred while fetching category hero content");
    } finally {
      setLoading((prev) => ({ ...prev, categoryHeroFetch: false }));
    }
  };

  const handleHeroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, heroSubmit: true }));

    try {
      const formData = new FormData();
      formData.append("tagline", heroContent.tagline);
      formData.append("heading", heroContent.heading);
      formData.append("highlightedText", heroContent.highlightedText);
      formData.append("description", heroContent.description);
      formData.append("primaryButtonText", heroContent.primaryButtonText);
      formData.append("secondaryButtonText", heroContent.secondaryButtonText);

      const fileInput = document.getElementById(
        "heroBackgroundImage"
      ) as HTMLInputElement;
      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        formData.append("backgroundImage", fileInput.files[0]);
      }

      const response = await fetch("/api/content/hero", {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        const updatedContent = await response.json();
        setHeroContent(updatedContent);
        toast.success("Home hero content updated successfully");
      } else {
        const result = await response.json();
        console.error("Error details:", result);
        toast.error(
          `Failed to update hero content: ${result.error || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error updating hero content:", error);
      toast.error("An error occurred while updating hero content");
    } finally {
      setLoading((prev) => ({ ...prev, heroSubmit: false }));
    }
  };

  const handleCategoryHeroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, categoryHeroSubmit: true }));

    try {
      const formData = new FormData();
      formData.append("heading", categoryHeroContent.heading);
      formData.append("highlightedText", categoryHeroContent.highlightedText);
      formData.append("description", categoryHeroContent.description);
      formData.append("buttonText", categoryHeroContent.buttonText);

      const fileInput = document.getElementById(
        "categoryHeroBackgroundImage"
      ) as HTMLInputElement;
      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        formData.append("backgroundImage", fileInput.files[0]);
      }

      const response = await fetch("/api/content/category-hero", {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        const updatedContent = await response.json();
        setCategoryHeroContent(updatedContent);
        toast.success("Category hero content updated successfully");
      } else {
        toast.error("Failed to update category hero content");
      }
    } catch (error) {
      console.error("Error updating category hero content:", error);
      toast.error("An error occurred while updating category hero content");
    } finally {
      setLoading((prev) => ({ ...prev, categoryHeroSubmit: false }));
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Content Management</h1>

      <Tabs
        defaultValue={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-8">
          <TabsTrigger value="hero-sections">Hero Sections</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
        </TabsList>

        <TabsContent value="hero-sections">
          <div className="grid gap-8">
            <Accordion type="single" collapsible defaultValue="home-hero">
              <AccordionItem value="home-hero">
                <AccordionTrigger className="text-xl font-semibold">
                  Home Page Hero Section
                </AccordionTrigger>
                <AccordionContent>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">
                        Edit Home Hero Section
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loading.heroFetch ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : (
                        <form onSubmit={handleHeroSubmit} className="space-y-6">
                          <div className="grid gap-4">
                            <div>
                              <Label htmlFor="tagline">Tagline</Label>
                              <Input
                                id="tagline"
                                value={heroContent.tagline}
                                onChange={(e) =>
                                  setHeroContent({
                                    ...heroContent,
                                    tagline: e.target.value,
                                  })
                                }
                                placeholder="Take Your Gaming to the Next Level"
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="heading">Heading</Label>
                                <Input
                                  id="heading"
                                  value={heroContent.heading}
                                  onChange={(e) =>
                                    setHeroContent({
                                      ...heroContent,
                                      heading: e.target.value,
                                    })
                                  }
                                  placeholder="High-Performance Gaming"
                                />
                              </div>
                              <div>
                                <Label htmlFor="highlightedText">
                                  Highlighted Text
                                </Label>
                                <Input
                                  id="highlightedText"
                                  value={heroContent.highlightedText}
                                  onChange={(e) =>
                                    setHeroContent({
                                      ...heroContent,
                                      highlightedText: e.target.value,
                                    })
                                  }
                                  placeholder="Accessories"
                                />
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="description">Description</Label>
                              <Textarea
                                id="description"
                                value={heroContent.description}
                                onChange={(e) =>
                                  setHeroContent({
                                    ...heroContent,
                                    description: e.target.value,
                                  })
                                }
                                placeholder="Equip yourself with high-performance gear..."
                                rows={3}
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="primaryButtonText">
                                  Primary Button Text
                                </Label>
                                <Input
                                  id="primaryButtonText"
                                  value={heroContent.primaryButtonText}
                                  onChange={(e) =>
                                    setHeroContent({
                                      ...heroContent,
                                      primaryButtonText: e.target.value,
                                    })
                                  }
                                  placeholder="Shop Now"
                                />
                              </div>
                              <div>
                                <Label htmlFor="secondaryButtonText">
                                  Secondary Button Text
                                </Label>
                                <Input
                                  id="secondaryButtonText"
                                  value={heroContent.secondaryButtonText}
                                  onChange={(e) =>
                                    setHeroContent({
                                      ...heroContent,
                                      secondaryButtonText: e.target.value,
                                    })
                                  }
                                  placeholder="New Arrivals!"
                                />
                              </div>
                            </div>

                            <Separator className="my-4" />

                            <div>
                              <Label htmlFor="heroBackgroundImage">
                                Background Image
                              </Label>
                              <div className="mt-2">
                                <Input
                                  id="heroBackgroundImage"
                                  type="file"
                                  accept="image/*"
                                />
                              </div>
                              {heroContent.backgroundImage && (
                                <div className="mt-4 relative h-48 w-full overflow-hidden rounded-lg border">
                                  <Image
                                    src={heroContent.backgroundImage}
                                    alt="Current hero background"
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          <Button type="submit" disabled={loading.heroSubmit}>
                            {loading.heroSubmit ? (
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
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="category-hero">
                <AccordionTrigger className="text-xl font-semibold">
                  Category Page Hero Section
                </AccordionTrigger>
                <AccordionContent>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">
                        Edit Category Hero Section
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loading.categoryHeroFetch ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : (
                        <form
                          onSubmit={handleCategoryHeroSubmit}
                          className="space-y-6"
                        >
                          <div className="grid gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="categoryHeading">Heading</Label>
                                <Input
                                  id="categoryHeading"
                                  value={categoryHeroContent.heading}
                                  onChange={(e) =>
                                    setCategoryHeroContent({
                                      ...categoryHeroContent,
                                      heading: e.target.value,
                                    })
                                  }
                                  placeholder="Discover the Ultimate"
                                />
                              </div>
                              <div>
                                <Label htmlFor="categoryHighlightedText">
                                  Highlighted Text
                                </Label>
                                <Input
                                  id="categoryHighlightedText"
                                  value={categoryHeroContent.highlightedText}
                                  onChange={(e) =>
                                    setCategoryHeroContent({
                                      ...categoryHeroContent,
                                      highlightedText: e.target.value,
                                    })
                                  }
                                  placeholder="Gaming Gear"
                                />
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="categoryDescription">
                                Description
                              </Label>
                              <Textarea
                                id="categoryDescription"
                                value={categoryHeroContent.description}
                                onChange={(e) =>
                                  setCategoryHeroContent({
                                    ...categoryHeroContent,
                                    description: e.target.value,
                                  })
                                }
                                placeholder="Explore top-tier gaming accessories..."
                                rows={3}
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="categoryButtonText">
                                  Button Text
                                </Label>
                                <Input
                                  id="categoryButtonText"
                                  value={categoryHeroContent.buttonText}
                                  onChange={(e) =>
                                    setCategoryHeroContent({
                                      ...categoryHeroContent,
                                      buttonText: e.target.value,
                                    })
                                  }
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
                              {categoryHeroContent.backgroundImage && (
                                <div className="mt-4 relative h-48 w-full overflow-hidden rounded-lg border">
                                  <Image
                                    src={categoryHeroContent.backgroundImage}
                                    alt="Current category hero background"
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          <Button
                            type="submit"
                            disabled={loading.categoryHeroSubmit}
                          >
                            {loading.categoryHeroSubmit ? (
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
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </TabsContent>

        <TabsContent value="faqs">
          <Card>
            <CardHeader>
              <CardTitle>FAQs Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This section will be implemented later. You can currently manage
                FAQs from the Reviews section.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offers">
          <Card>
            <CardHeader>
              <CardTitle>Offers Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This section will be implemented later.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
