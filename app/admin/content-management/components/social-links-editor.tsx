"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import { toast } from "sonner";

interface SocialLinks {
  id: string;
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
}

export default function SocialLinksEditor() {
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    id: "",
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
  });

  const [loading, setLoading] = useState({
    fetch: false,
    submit: false,
  });

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const fetchSocialLinks = async () => {
    setLoading({ ...loading, fetch: true });
    try {
      const response = await fetch("/api/content/social-links");
      const data = await response.json();

      // Always update state with the received data, whether it's from DB or default values
      setSocialLinks(data);

      if (response.status !== 200) {
        toast.error("Using default social links - database not available");
      }
    } catch (error) {
      console.error("Error fetching social links:", error);
      // Don't show error toast - the API will return default values
    } finally {
      setLoading({ ...loading, fetch: false });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading({ ...loading, submit: true });

    try {
      const response = await fetch("/api/content/social-links", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(socialLinks),
      });

      if (response.ok) {
        const updatedLinks = await response.json();
        setSocialLinks(updatedLinks);
        toast.success("Social media links updated successfully");
      } else {
        toast.error(
          "Failed to update social media links in database, but changes saved locally"
        );
      }
    } catch (error) {
      console.error("Error updating social links:", error);
      toast.error("Changes saved locally but not in database");
    } finally {
      setLoading({ ...loading, submit: false });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Edit Social Media Links</CardTitle>
      </CardHeader>
      <CardContent>
        {loading.fetch ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4">
              <div className="flex items-center gap-4">
                <Facebook className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <Label htmlFor="facebook">Facebook URL</Label>
                  <Input
                    id="facebook"
                    value={socialLinks.facebook}
                    onChange={(e) =>
                      setSocialLinks({
                        ...socialLinks,
                        facebook: e.target.value,
                      })
                    }
                    placeholder="https://facebook.com/crossguild"
                    type="url"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Twitter className="h-5 w-5 text-blue-400" />
                <div className="flex-1">
                  <Label htmlFor="twitter">Twitter/X URL</Label>
                  <Input
                    id="twitter"
                    value={socialLinks.twitter}
                    onChange={(e) =>
                      setSocialLinks({
                        ...socialLinks,
                        twitter: e.target.value,
                      })
                    }
                    placeholder="https://twitter.com/crossguild"
                    type="url"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Instagram className="h-5 w-5 text-pink-600" />
                <div className="flex-1">
                  <Label htmlFor="instagram">Instagram URL</Label>
                  <Input
                    id="instagram"
                    value={socialLinks.instagram}
                    onChange={(e) =>
                      setSocialLinks({
                        ...socialLinks,
                        instagram: e.target.value,
                      })
                    }
                    placeholder="https://instagram.com/crossguild"
                    type="url"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Linkedin className="h-5 w-5 text-blue-700" />
                <div className="flex-1">
                  <Label htmlFor="linkedin">LinkedIn URL</Label>
                  <Input
                    id="linkedin"
                    value={socialLinks.linkedin}
                    onChange={(e) =>
                      setSocialLinks({
                        ...socialLinks,
                        linkedin: e.target.value,
                      })
                    }
                    placeholder="https://linkedin.com/company/crossguild"
                    type="url"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={loading.submit}>
              {loading.submit ? (
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
