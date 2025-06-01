"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

interface ContactInfo {
  id: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone1: string;
  phone2?: string | null;
  email1: string;
  email2?: string | null;
  businessHours: string;
  mapEmbedUrl: string;
}

export default function ContactInfoEditor() {
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    id: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone1: "",
    phone2: "",
    email1: "",
    email2: "",
    businessHours: "",
    mapEmbedUrl: "",
  });

  const [loading, setLoading] = useState({
    fetch: false,
    submit: false,
  });

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    setLoading({ ...loading, fetch: true });
    try {
      const response = await axios.get("/api/content/contact-info");
      setContactInfo(response.data);
    } catch (error) {
      console.error("Error fetching contact info:", error);
      toast.error("Unable to load contact information. Creating a new entry.");
    } finally {
      setLoading({ ...loading, fetch: false });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading({ ...loading, submit: true });

    try {
      const response = await axios.put(
        "/api/content/contact-info",
        contactInfo
      );

      if (response.status === 200) {
        setContactInfo(response.data);
        toast.success("Contact information updated successfully");
      } else {
        toast.error("Failed to update contact information");
      }
    } catch (error) {
      console.error("Error updating contact info:", error);
      toast.error("An error occurred while updating contact information");
    } finally {
      setLoading({ ...loading, submit: false });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          Edit Location & Contact Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading.fetch ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={contactInfo.address}
                  onChange={(e) =>
                    setContactInfo({ ...contactInfo, address: e.target.value })
                  }
                  placeholder="123 Commerce Street"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={contactInfo.city}
                    onChange={(e) =>
                      setContactInfo({ ...contactInfo, city: e.target.value })
                    }
                    placeholder="Paris"
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={contactInfo.postalCode}
                    onChange={(e) =>
                      setContactInfo({
                        ...contactInfo,
                        postalCode: e.target.value,
                      })
                    }
                    placeholder="75000"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={contactInfo.country}
                    onChange={(e) =>
                      setContactInfo({
                        ...contactInfo,
                        country: e.target.value,
                      })
                    }
                    placeholder="France"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone1">Phone Number 1</Label>
                  <Input
                    id="phone1"
                    value={contactInfo.phone1}
                    onChange={(e) =>
                      setContactInfo({ ...contactInfo, phone1: e.target.value })
                    }
                    placeholder="+33 (0)1 23 45 67 89"
                  />
                </div>
                <div>
                  <Label htmlFor="phone2">Phone Number 2 (Optional)</Label>
                  <Input
                    id="phone2"
                    value={contactInfo.phone2 || ""}
                    onChange={(e) =>
                      setContactInfo({ ...contactInfo, phone2: e.target.value })
                    }
                    placeholder="+33 (0)9 87 65 43 21"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email1">Email 1</Label>
                  <Input
                    id="email1"
                    value={contactInfo.email1}
                    onChange={(e) =>
                      setContactInfo({ ...contactInfo, email1: e.target.value })
                    }
                    placeholder="contact@crossguild.com"
                    type="email"
                  />
                </div>
                <div>
                  <Label htmlFor="email2">Email 2 (Optional)</Label>
                  <Input
                    id="email2"
                    value={contactInfo.email2 || ""}
                    onChange={(e) =>
                      setContactInfo({ ...contactInfo, email2: e.target.value })
                    }
                    placeholder="support@crossguild.com"
                    type="email"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="businessHours">Business Hours</Label>
                <Textarea
                  id="businessHours"
                  value={contactInfo.businessHours}
                  onChange={(e) =>
                    setContactInfo({
                      ...contactInfo,
                      businessHours: e.target.value,
                    })
                  }
                  placeholder="Monday - Friday: 9am - 6pm&#10;Saturday: 10am - 4pm&#10;Sunday: Closed"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use line breaks for different days.
                </p>
              </div>

              <div>
                <Label htmlFor="mapEmbedUrl">Google Maps Embed URL</Label>
                <Input
                  id="mapEmbedUrl"
                  value={contactInfo.mapEmbedUrl}
                  onChange={(e) =>
                    setContactInfo({
                      ...contactInfo,
                      mapEmbedUrl: e.target.value,
                    })
                  }
                  placeholder="https://www.google.com/maps/embed?pb=..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Get this from Google Maps by clicking &quot;Share&quot; and
                  selecting &quot;Embed a map&quot;
                </p>
              </div>

              {contactInfo.mapEmbedUrl && (
                <div className="aspect-square max-h-[300px] w-full overflow-hidden rounded-md border">
                  <iframe
                    src={contactInfo.mapEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                </div>
              )}
            </div>

            <Button type="submit" disabled={loading.submit}>
              {loading.submit ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Contact Information"
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
