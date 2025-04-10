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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

interface Offer {
  id: string;
  title: string;
  description: string;
  image: string;
  buttonLabel: string;
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

  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [newOffer, setNewOffer] = useState({
    title: "",
    description: "",
    buttonLabel: "Free Delivery",
  });

  const [loading, setLoading] = useState({
    heroFetch: false,
    categoryHeroFetch: false,
    heroSubmit: false,
    categoryHeroSubmit: false,
  });

  const [loadingOffers, setLoadingOffers] = useState(false);
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === "hero-sections") {
      fetchHeroContent();
      fetchCategoryHeroContent();
    } else if (activeTab === "offers") {
      fetchOffers();
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

  const fetchOffers = async () => {
    setLoadingOffers(true);
    try {
      const response = await fetch("/api/offers");
      if (response.ok) {
        const data = await response.json();
        setOffers(data);
      } else {
        toast.error("Failed to fetch offers");
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
      toast.error("An error occurred while fetching offers");
    } finally {
      setLoadingOffers(false);
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

  const handleAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingOffer(true);
    try {
      const formData = new FormData();
      formData.append("title", newOffer.title);
      formData.append("description", newOffer.description);
      formData.append("buttonLabel", newOffer.buttonLabel);

      const fileInput = document.getElementById(
        "newOfferImage"
      ) as HTMLInputElement;
      if (fileInput?.files && fileInput.files.length > 0) {
        formData.append("image", fileInput.files[0]);
      }

      const response = await fetch("/api/offers", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast.success("Offer added successfully");
        setNewOffer({
          title: "",
          description: "",
          buttonLabel: "Free Delivery",
        });
        if (fileInput) fileInput.value = "";
        fetchOffers();
      } else {
        toast.error("Failed to add offer");
      }
    } catch (error) {
      console.error("Error adding offer:", error);
      toast.error("An error occurred while adding the offer");
    } finally {
      setSubmittingOffer(false);
    }
  };

  const handleUpdateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffer) return;

    setSubmittingOffer(true);
    try {
      const formData = new FormData();
      formData.append("title", selectedOffer.title);
      formData.append("description", selectedOffer.description);
      formData.append("buttonLabel", selectedOffer.buttonLabel);

      const fileInput = document.getElementById(
        "updateOfferImage"
      ) as HTMLInputElement;
      if (fileInput?.files && fileInput.files.length > 0) {
        formData.append("image", fileInput.files[0]);
      }

      const response = await fetch(`/api/offers/${selectedOffer.id}`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        toast.success("Offer updated successfully");
        setSelectedOffer(null);
        fetchOffers();
      } else {
        toast.error("Failed to update offer");
      }
    } catch (error) {
      console.error("Error updating offer:", error);
      toast.error("An error occurred while updating the offer");
    } finally {
      setSubmittingOffer(false);
    }
  };

  const handleDeleteOffer = async (id: string) => {
    try {
      const response = await fetch(`/api/offers/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Offer deleted successfully");
        fetchOffers();
      } else {
        toast.error("Failed to delete offer");
      }
    } catch (error) {
      console.error("Error deleting offer:", error);
      toast.error("An error occurred while deleting the offer");
    } finally {
      setOfferToDelete(null);
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
              {loadingOffers ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Current Offers
                    </h3>
                    {offers.length === 0 ? (
                      <p className="text-muted-foreground">No offers found.</p>
                    ) : (
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        {offers.map((offer) => (
                          <Card key={offer.id} className="overflow-hidden">
                            <CardContent className="p-4">
                              <div className="flex flex-col md:flex-row gap-4">
                                <div className="w-full md:w-1/3 relative h-40">
                                  <Image
                                    src={offer.image}
                                    alt={offer.title}
                                    fill
                                    className="object-cover rounded"
                                  />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-bold">{offer.title}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {offer.description}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Button Label: {offer.buttonLabel}
                                  </p>
                                  <div className="flex gap-2 mt-4">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setSelectedOffer(offer)}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => setOfferToDelete(offer.id)}
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator />

                  {selectedOffer ? (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Update Offer
                      </h3>
                      <form onSubmit={handleUpdateOffer} className="space-y-4">
                        <div>
                          <Label htmlFor="updateOfferTitle">Title</Label>
                          <Input
                            id="updateOfferTitle"
                            value={selectedOffer.title}
                            onChange={(e) =>
                              setSelectedOffer({
                                ...selectedOffer,
                                title: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="updateOfferDescription">
                            Description
                          </Label>
                          <Textarea
                            id="updateOfferDescription"
                            value={selectedOffer.description}
                            onChange={(e) =>
                              setSelectedOffer({
                                ...selectedOffer,
                                description: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="updateOfferButtonLabel">
                            Button Label
                          </Label>
                          <Input
                            id="updateOfferButtonLabel"
                            value={selectedOffer.buttonLabel}
                            onChange={(e) =>
                              setSelectedOffer({
                                ...selectedOffer,
                                buttonLabel: e.target.value,
                              })
                            }
                            placeholder="Free Delivery"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="updateOfferImage">Image</Label>
                          <Input
                            id="updateOfferImage"
                            type="file"
                            accept="image/*"
                          />
                          <div className="mt-2 relative h-40 w-full overflow-hidden rounded-lg border">
                            <Image
                              src={selectedOffer.image}
                              alt="Current offer image"
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" disabled={submittingOffer}>
                            {submittingOffer ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              "Update Offer"
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setSelectedOffer(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Add New Offer
                      </h3>
                      <form onSubmit={handleAddOffer} className="space-y-4">
                        <div>
                          <Label htmlFor="newOfferTitle">Title</Label>
                          <Input
                            id="newOfferTitle"
                            value={newOffer.title}
                            onChange={(e) =>
                              setNewOffer({
                                ...newOffer,
                                title: e.target.value,
                              })
                            }
                            placeholder="Holiday Special"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="newOfferDescription">
                            Description
                          </Label>
                          <Textarea
                            id="newOfferDescription"
                            value={newOffer.description}
                            onChange={(e) =>
                              setNewOffer({
                                ...newOffer,
                                description: e.target.value,
                              })
                            }
                            placeholder="Get 30% Off"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="newOfferButtonLabel">
                            Button Label
                          </Label>
                          <Input
                            id="newOfferButtonLabel"
                            value={newOffer.buttonLabel}
                            onChange={(e) =>
                              setNewOffer({
                                ...newOffer,
                                buttonLabel: e.target.value,
                              })
                            }
                            placeholder="Free Delivery"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="newOfferImage">Image</Label>
                          <Input
                            id="newOfferImage"
                            type="file"
                            accept="image/*"
                            required
                          />
                        </div>
                        <Button type="submit" disabled={submittingOffer}>
                          {submittingOffer ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            "Add Offer"
                          )}
                        </Button>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alert Dialog for Delete Confirmation */}
      <AlertDialog
        open={!!offerToDelete}
        onOpenChange={(open) => !open && setOfferToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              offer and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => offerToDelete && handleDeleteOffer(offerToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
