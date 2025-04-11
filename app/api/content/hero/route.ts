import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    // Try to fetch the existing hero content
    let heroContent = await prisma.heroContent.findFirst();

    // If no content exists yet, create default content
    if (!heroContent) {
      heroContent = await prisma.heroContent.create({
        data: {
          tagline: "Take Your Gaming to the Next Level",
          heading: "High-Performance Gaming",
          highlightedText: "Accessories",
          description:
            "Equip yourself with high-performance gear designed to boost your gameplay, offering precision, comfort, and durability for every battle.",
          primaryButtonText: "Shop Now",
          secondaryButtonText: "New Arrivals!",
          backgroundImage: "/HeroImg.svg",
        },
      });
    }

    return NextResponse.json(heroContent);
  } catch (error) {
    console.error("Error fetching hero content:", error);
    return NextResponse.json(
      { error: "Failed to fetch hero content" },
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
    const tagline = formData.get("tagline") as string;
    const heading = formData.get("heading") as string;
    const highlightedText = formData.get("highlightedText") as string;
    const description = formData.get("description") as string;
    const primaryButtonText = formData.get("primaryButtonText") as string;
    const secondaryButtonText = formData.get("secondaryButtonText") as string;
    const backgroundImage = formData.get("backgroundImage") as File;

    // Get existing hero content
    const heroContent = await prisma.heroContent.findFirst();
    let imagePath = heroContent?.backgroundImage || "/HeroImg.svg";

    // If a new image was uploaded, process it
    if (backgroundImage && backgroundImage.size > 0) {
      const bytes = await backgroundImage.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const filename = `hero-${Date.now()}-${backgroundImage.name}`;
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

    // Update or create the hero content
    const updatedHeroContent = await prisma.heroContent.upsert({
      where: { id: heroContent?.id || "" },
      update: {
        tagline,
        heading,
        highlightedText,
        description,
        primaryButtonText,
        secondaryButtonText,
        backgroundImage: imagePath,
      },
      create: {
        tagline,
        heading,
        highlightedText,
        description,
        primaryButtonText,
        secondaryButtonText,
        backgroundImage: imagePath,
      },
    });

    return NextResponse.json(updatedHeroContent);
  } catch (error) {
    console.error("Error updating hero content:", error);
    return NextResponse.json(
      {
        error: "Failed to update hero content",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
