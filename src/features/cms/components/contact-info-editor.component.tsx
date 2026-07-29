"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { useContactInfo } from "@/features/cms/hooks/use-contact-info.hook";
import type { ContactInfo } from "@/features/cms/types/cms.type";

const emptyContactInfo: ContactInfo = {
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
};

export default function ContactInfoEditor() {
  const { contactInfo, isLoading, isSubmitting, updateContactInfo } =
    useContactInfo();
  const [form, setForm] = useState<ContactInfo>(emptyContactInfo);

  useEffect(() => {
    if (contactInfo) setForm(contactInfo);
  }, [contactInfo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateContactInfo(form);
  };

  const update = (field: keyof ContactInfo, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          Edit Location & Contact Details
        </CardTitle>
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
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  placeholder="123 Commerce Street"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    placeholder="Paris"
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={form.postalCode}
                    onChange={(e) => update("postalCode", e.target.value)}
                    placeholder="75000"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={form.country}
                    onChange={(e) => update("country", e.target.value)}
                    placeholder="France"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone1">Phone Number 1</Label>
                  <Input
                    id="phone1"
                    value={form.phone1}
                    onChange={(e) => update("phone1", e.target.value)}
                    placeholder="+33 (0)1 23 45 67 89"
                  />
                </div>
                <div>
                  <Label htmlFor="phone2">Phone Number 2 (Optional)</Label>
                  <Input
                    id="phone2"
                    value={form.phone2 || ""}
                    onChange={(e) => update("phone2", e.target.value)}
                    placeholder="+33 (0)9 87 65 43 21"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email1">Email 1</Label>
                  <Input
                    id="email1"
                    value={form.email1}
                    onChange={(e) => update("email1", e.target.value)}
                    placeholder="contact@crossguild.com"
                    type="email"
                  />
                </div>
                <div>
                  <Label htmlFor="email2">Email 2 (Optional)</Label>
                  <Input
                    id="email2"
                    value={form.email2 || ""}
                    onChange={(e) => update("email2", e.target.value)}
                    placeholder="support@crossguild.com"
                    type="email"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="businessHours">Business Hours</Label>
                <Textarea
                  id="businessHours"
                  value={form.businessHours}
                  onChange={(e) => update("businessHours", e.target.value)}
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
                  value={form.mapEmbedUrl}
                  onChange={(e) => update("mapEmbedUrl", e.target.value)}
                  placeholder="https://www.google.com/maps/embed?pb=..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Get this from Google Maps by clicking &quot;Share&quot; and
                  selecting &quot;Embed a map&quot;
                </p>
              </div>

              {form.mapEmbedUrl && (
                <div className="aspect-square max-h-[300px] w-full overflow-hidden rounded-md border">
                  <iframe
                    src={form.mapEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    title="Map preview"
                  />
                </div>
              )}
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
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
