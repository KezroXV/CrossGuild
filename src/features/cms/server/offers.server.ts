import prisma from "@/shared/lib/prisma";
import { NotFoundError } from "@/shared/lib/handle-api-error";
import { uploadImage } from "@/shared/services/upload.service";

const DEFAULT_OFFERS = [
  {
    id: "default1",
    title: "Holiday Special",
    description: "Get 30% Off",
    buttonLabel: "Free Delivery",
    image: "/offers/offer1.png",
  },
  {
    id: "default2",
    title: "New Arrivals",
    description: "Limited Edition Gear",
    buttonLabel: "Free Delivery",
    image: "/offers/offer2.png",
  },
];

export type CreateOfferInput = {
  title: string;
  description: string;
  buttonLabel: string;
  image?: File | null;
};

export type UpdateOfferInput = {
  title: string;
  description: string;
  buttonLabel: string;
  image?: File | null;
};

async function resolveOfferImage(image?: File | null) {
  if (image && image.size > 0) {
    return uploadImage(image, { folder: "crossguild/offers" });
  }

  return "/offers/default.png";
}

export async function getOffers() {
  try {
    await prisma.offer.findFirst();
  } catch {
    return DEFAULT_OFFERS;
  }

  const offers = await prisma.offer.findMany({
    orderBy: { createdAt: "desc" },
  });

  if (offers.length === 0) {
    return DEFAULT_OFFERS;
  }

  return offers;
}

export async function createOffer(input: CreateOfferInput) {
  const imagePath = await resolveOfferImage(input.image);

  return prisma.offer.create({
    data: {
      title: input.title,
      description: input.description,
      buttonLabel: input.buttonLabel,
      image: imagePath,
    },
  });
}

export async function createOfferFromFormData(formData: FormData) {
  return createOffer({
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    buttonLabel: (formData.get("buttonLabel") as string) || "Free Delivery",
    image: formData.get("image") as File,
  });
}

export async function updateOffer(offerId: string, input: UpdateOfferInput) {
  const existingOffer = await prisma.offer.findUnique({
    where: { id: offerId },
  });

  if (!existingOffer) {
    throw new NotFoundError("Offer not found");
  }

  let imagePath = existingOffer.image;

  if (input.image && input.image.size > 0) {
    imagePath = await uploadImage(input.image, { folder: "crossguild/offers" });
  }

  return prisma.offer.update({
    where: { id: offerId },
    data: {
      title: input.title,
      description: input.description,
      buttonLabel: input.buttonLabel,
      image: imagePath,
      updatedAt: new Date(),
    },
  });
}

export async function updateOfferFromFormData(
  offerId: string,
  formData: FormData
) {
  return updateOffer(offerId, {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    buttonLabel: (formData.get("buttonLabel") as string) || "Free Delivery",
    image: formData.get("image") as File,
  });
}

export async function deleteOffer(offerId: string) {
  const existingOffer = await prisma.offer.findUnique({
    where: { id: offerId },
  });

  if (!existingOffer) {
    throw new NotFoundError("Offer not found");
  }

  await prisma.offer.delete({ where: { id: offerId } });

  return { message: "Offer deleted successfully" };
}
