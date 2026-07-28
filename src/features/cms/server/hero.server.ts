import { writeFile } from "fs/promises";
import path from "path";
import prisma from "@/shared/lib/prisma";

const DEFAULT_HERO = {
  tagline: "Take Your Gaming to the Next Level",
  heading: "High-Performance Gaming",
  highlightedText: "Accessories",
  description:
    "Equip yourself with high-performance gear designed to boost your gameplay, offering precision, comfort, and durability for every battle.",
  primaryButtonText: "Shop Now",
  secondaryButtonText: "New Arrivals!",
  backgroundImage: "/HeroImg.svg",
};

export type UpdateHeroInput = {
  tagline: string;
  heading: string;
  highlightedText: string;
  description: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  backgroundImage?: File | null;
};

async function saveHeroImage(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = `hero-${Date.now()}-${file.name}`;
  const uploadPath = path.join(process.cwd(), "public", "uploads", filename);
  await writeFile(uploadPath, buffer);
  return `/uploads/${filename}`;
}

export async function getHeroContent() {
  let heroContent = await prisma.heroContent.findFirst();

  if (!heroContent) {
    heroContent = await prisma.heroContent.create({ data: DEFAULT_HERO });
  }

  return heroContent;
}

export async function updateHeroContent(input: UpdateHeroInput) {
  const heroContent = await prisma.heroContent.findFirst();
  let imagePath = heroContent?.backgroundImage || DEFAULT_HERO.backgroundImage;

  if (input.backgroundImage && input.backgroundImage.size > 0) {
    imagePath = await saveHeroImage(input.backgroundImage);
  }

  return prisma.heroContent.upsert({
    where: { id: heroContent?.id || "" },
    update: {
      tagline: input.tagline,
      heading: input.heading,
      highlightedText: input.highlightedText,
      description: input.description,
      primaryButtonText: input.primaryButtonText,
      secondaryButtonText: input.secondaryButtonText,
      backgroundImage: imagePath,
    },
    create: {
      tagline: input.tagline,
      heading: input.heading,
      highlightedText: input.highlightedText,
      description: input.description,
      primaryButtonText: input.primaryButtonText,
      secondaryButtonText: input.secondaryButtonText,
      backgroundImage: imagePath,
    },
  });
}

export async function updateHeroFromFormData(formData: FormData) {
  return updateHeroContent({
    tagline: formData.get("tagline") as string,
    heading: formData.get("heading") as string,
    highlightedText: formData.get("highlightedText") as string,
    description: formData.get("description") as string,
    primaryButtonText: formData.get("primaryButtonText") as string,
    secondaryButtonText: formData.get("secondaryButtonText") as string,
    backgroundImage: formData.get("backgroundImage") as File,
  });
}
