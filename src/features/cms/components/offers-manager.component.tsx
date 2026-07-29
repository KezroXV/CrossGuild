"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Separator } from "@/shared/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { useOffers } from "@/features/cms/hooks/use-offers.hook";
import type { NewOfferInput, Offer } from "@/features/cms/types/cms.type";

const defaultNewOffer: NewOfferInput = {
  title: "",
  description: "",
  buttonLabel: "Free Delivery",
};

export default function OffersManager() {
  const { offers, isLoading, isSubmitting, createOffer, updateOffer, deleteOffer } =
    useOffers();
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [newOffer, setNewOffer] = useState<NewOfferInput>(defaultNewOffer);
  const [offerToDelete, setOfferToDelete] = useState<string | null>(null);

  const handleAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = buildOfferFormData(newOffer);
    const fileInput = document.getElementById("newOfferImage") as HTMLInputElement;
    if (fileInput?.files?.length) {
      formData.append("image", fileInput.files[0]);
    }
    await createOffer(formData);
    setNewOffer(defaultNewOffer);
    if (fileInput) fileInput.value = "";
  };

  const handleUpdateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffer) return;

    const formData = buildOfferFormData({
      title: selectedOffer.title,
      description: selectedOffer.description,
      buttonLabel: selectedOffer.buttonLabel,
    });
    const fileInput = document.getElementById("updateOfferImage") as HTMLInputElement;
    if (fileInput?.files?.length) {
      formData.append("image", fileInput.files[0]);
    }
    await updateOffer({ id: selectedOffer.id, formData });
    setSelectedOffer(null);
  };

  const handleDeleteOffer = async (id: string) => {
    await deleteOffer(id);
    setOfferToDelete(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Offers Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Offers Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <OffersList
              offers={offers}
              onEdit={setSelectedOffer}
              onDelete={setOfferToDelete}
            />
            <Separator />
            {selectedOffer ? (
              <OfferForm
                title="Update Offer"
                offer={selectedOffer}
                imageInputId="updateOfferImage"
                showCurrentImage
                submitLabel="Update Offer"
                isSubmitting={isSubmitting}
                onSubmit={handleUpdateOffer}
                onCancel={() => setSelectedOffer(null)}
                onChange={(offer) => setSelectedOffer(offer as Offer)}
              />
            ) : (
              <OfferForm
                title="Add New Offer"
                offer={newOffer}
                imageInputId="newOfferImage"
                imageRequired
                submitLabel="Add Offer"
                isSubmitting={isSubmitting}
                onSubmit={handleAddOffer}
                onChange={(offer) =>
                  setNewOffer(offer as NewOfferInput)
                }
              />
            )}
          </div>
        </CardContent>
      </Card>

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
    </>
  );
}

function buildOfferFormData(input: NewOfferInput): FormData {
  const formData = new FormData();
  formData.append("title", input.title);
  formData.append("description", input.description);
  formData.append("buttonLabel", input.buttonLabel);
  return formData;
}

function OffersList({
  offers,
  onEdit,
  onDelete,
}: {
  offers: Offer[];
  onEdit: (offer: Offer) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Current Offers</h3>
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
                      <Button size="sm" variant="outline" onClick={() => onEdit(offer)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDelete(offer.id)}
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
  );
}

type OfferFormProps = {
  title: string;
  offer: Offer | NewOfferInput;
  imageInputId: string;
  imageRequired?: boolean;
  showCurrentImage?: boolean;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel?: () => void;
  onChange: (offer: Offer | NewOfferInput) => void;
};

function OfferForm({
  title,
  offer,
  imageInputId,
  imageRequired,
  showCurrentImage,
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
  onChange,
}: OfferFormProps) {
  const update = (field: keyof NewOfferInput, value: string) => {
    onChange({ ...offer, [field]: value });
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor={`${imageInputId}Title`}>Title</Label>
          <Input
            id={`${imageInputId}Title`}
            value={offer.title}
            onChange={(e) => update("title", e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor={`${imageInputId}Description`}>Description</Label>
          <Textarea
            id={`${imageInputId}Description`}
            value={offer.description}
            onChange={(e) => update("description", e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor={`${imageInputId}ButtonLabel`}>Button Label</Label>
          <Input
            id={`${imageInputId}ButtonLabel`}
            value={offer.buttonLabel}
            onChange={(e) => update("buttonLabel", e.target.value)}
            placeholder="Free Delivery"
            required
          />
        </div>
        <div>
          <Label htmlFor={imageInputId}>Image</Label>
          <Input
            id={imageInputId}
            type="file"
            accept="image/*"
            required={imageRequired}
          />
          {showCurrentImage && "image" in offer && offer.image && (
            <div className="mt-2 relative h-40 w-full overflow-hidden rounded-lg border">
              <Image
                src={offer.image}
                alt="Current offer image"
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              submitLabel
            )}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
