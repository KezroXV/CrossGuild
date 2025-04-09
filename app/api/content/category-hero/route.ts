import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    // Try to fetch the existing category hero content
    let categoryHeroContent = await prisma.categoryHeroContent.findFirst();

    // If no content exists yet, create default content
    if (!categoryHeroContent) {
      categoryHeroContent = await prisma.categoryHeroContent.create({
        data: {
          heading: "Discover the Ultimate",
          highlightedText: "Gaming Gear",
          description:
            "Explore top-tier gaming accessories designed to enhance your performance and take your gaming to the next level. Find the perfect gear and dominate every session.",
          buttonText: "Explore Categories",
          backgroundImage: "/CateImg.svg",
        },
      });
    }

    return NextResponse.json(categoryHeroContent);
  } catch (error) {
    console.error("Error fetching category hero content:", error);
    return NextResponse.json(
      { error: "Failed to fetch category hero content" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const heading = formData.get("heading") as string;
    const highlightedText = formData.get("highlightedText") as string;
    const description = formData.get("description") as string;
    const buttonText = formData.get("buttonText") as string;
    const backgroundImage = formData.get("backgroundImage") as File;

    // Get existing category hero content
    const categoryHeroContent = await prisma.categoryHeroContent.findFirst();
    let imagePath = categoryHeroContent?.backgroundImage || "/CateImg.svg";

    // If a new image was uploaded, process it
    if (backgroundImage && backgroundImage.size > 0) {
      const bytes = await backgroundImage.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const filename = `category-hero-${Date.now()}-${backgroundImage.name}`;
      const uploadPath = path.join(
        process.cwd(),
        "public",
        "uploads",
        filename
      );

      // Save the file
      await writeFile(uploadPath, buffer);
      imagePath = `/uploads/${filename}`;
    }

    // Update or create the category hero content
    const updatedCategoryHeroContent = await prisma.categoryHeroContent.upsert({
      where: { id: categoryHeroContent?.id || "" },
      update: {
        heading,
        highlightedText,
        description,
        buttonText,
        backgroundImage: imagePath,
      },
      create: {
        heading,
        highlightedText,
        description,
        buttonText,
        backgroundImage: imagePath,
      },
    });

    return NextResponse.json(updatedCategoryHeroContent);
  } catch (error) {
    console.error("Error updating category hero content:", error);
    return NextResponse.json(
      { error: "Failed to update category hero content" },
      { status: 500 }
    );
  }
}
