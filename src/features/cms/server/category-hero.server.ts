import { writeFile } from "fs/promises";
import path from "path";
import prisma from "@/shared/lib/prisma";

const DEFAULT_CATEGORY_HERO = {
  heading: "Discover the Ultimate",
  highlightedText: "Gaming Gear",
  description:
    "Explore top-tier gaming accessories designed to enhance your performance and take your gaming to the next level. Find the perfect gear and dominate every session.",
  buttonText: "Explore Categories",
  backgroundImage: "/CateImg.svg",
};

export type UpdateCategoryHeroInput = {
  heading: string;
  highlightedText: string;
  description: string;
  buttonText: string;
  backgroundImage?: File | null;
};

async function saveCategoryHeroImage(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = `category-hero-${Date.now()}-${file.name}`;
  const uploadPath = path.join(process.cwd(), "public", "uploads", filename);
  await writeFile(uploadPath, buffer);
  return `/uploads/${filename}`;
}

export async function getCategoryHeroContent() {
  let categoryHeroContent = await prisma.categoryHeroContent.findFirst();

  if (!categoryHeroContent) {
    categoryHeroContent = await prisma.categoryHeroContent.create({
      data: DEFAULT_CATEGORY_HERO,
    });
  }

  return categoryHeroContent;
}

export async function updateCategoryHeroContent(input: UpdateCategoryHeroInput) {
  const categoryHeroContent = await prisma.categoryHeroContent.findFirst();
  let imagePath =
    categoryHeroContent?.backgroundImage || DEFAULT_CATEGORY_HERO.backgroundImage;

  if (input.backgroundImage && input.backgroundImage.size > 0) {
    imagePath = await saveCategoryHeroImage(input.backgroundImage);
  }

  return prisma.categoryHeroContent.upsert({
    where: { id: categoryHeroContent?.id || "" },
    update: {
      heading: input.heading,
      highlightedText: input.highlightedText,
      description: input.description,
      buttonText: input.buttonText,
      backgroundImage: imagePath,
    },
    create: {
      heading: input.heading,
      highlightedText: input.highlightedText,
      description: input.description,
      buttonText: input.buttonText,
      backgroundImage: imagePath,
    },
  });
}

export async function updateCategoryHeroFromFormData(formData: FormData) {
  return updateCategoryHeroContent({
    heading: formData.get("heading") as string,
    highlightedText: formData.get("highlightedText") as string,
    description: formData.get("description") as string,
    buttonText: formData.get("buttonText") as string,
    backgroundImage: formData.get("backgroundImage") as File,
  });
}
