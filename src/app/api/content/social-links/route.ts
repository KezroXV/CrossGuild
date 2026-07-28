import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Try to fetch existing social links
    const socialLinks = await prisma.socialLinks.findFirst();

    // If no social links exist, create default ones
    if (!socialLinks) {
      const newSocialLinks = await prisma.socialLinks.create({
        data: {
          facebook: "https://facebook.com/crossguild",
          twitter: "https://twitter.com/crossguild",
          instagram: "https://instagram.com/crossguild",
          linkedin: "https://linkedin.com/company/crossguild",
        },
      });
      return NextResponse.json(newSocialLinks);
    }

    return NextResponse.json(socialLinks);
  } catch (error) {
    console.error("Error fetching social links:", error);

    // Check if it's a PrismaClient initialization error or missing table error
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("does not exist in the current database")) {
      return NextResponse.json(
        {
          error:
            "The SocialLinks table doesn't exist yet. Please run Prisma migrations.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch social media links" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();

    // Find existing record
    const existingLinks = await prisma.socialLinks.findFirst();

    let updatedLinks;
    if (existingLinks) {
      // Update existing record
      updatedLinks = await prisma.socialLinks.update({
        where: { id: existingLinks.id },
        data: {
          facebook: data.facebook,
          twitter: data.twitter,
          instagram: data.instagram,
          linkedin: data.linkedin,
        },
      });
    } else {
      // Create new record if none exists
      updatedLinks = await prisma.socialLinks.create({
        data: {
          facebook: data.facebook,
          twitter: data.twitter,
          instagram: data.instagram,
          linkedin: data.linkedin,
        },
      });
    }

    return NextResponse.json(updatedLinks);
  } catch (error) {
    console.error("Error updating social links:", error);
    return NextResponse.json(
      { error: "Failed to update social media links" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
