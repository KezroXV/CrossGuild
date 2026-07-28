import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/shared/lib/with-admin";
import prisma from "@/shared/lib/prisma";

export async function GET() {
  try {
    const socialLinks = await prisma.socialLinks.findFirst();

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
  }
}

export const PUT = withAdmin(async (request: NextRequest) => {
  try {
    const data = await request.json();

    const existingLinks = await prisma.socialLinks.findFirst();

    let updatedLinks;
    if (existingLinks) {
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
  }
});
