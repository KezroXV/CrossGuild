import { NextRequest } from "next/server";
import {
  getSocialLinks,
  isMissingSocialLinksTable,
  updateSocialLinks,
} from "@/features/cms/server/social-links.server";
import { withAdmin } from "@/shared/lib/with-admin";
import { handleApiError } from "@/shared/lib/handle-api-error";

export async function GET() {
  try {
    const socialLinks = await getSocialLinks();
    return Response.json(socialLinks);
  } catch (error) {
    console.error("Error fetching social links:", error);

    if (isMissingSocialLinksTable(error)) {
      return Response.json(
        {
          error:
            "The SocialLinks table doesn't exist yet. Please run Prisma migrations.",
        },
        { status: 500 }
      );
    }

    return Response.json(
      { error: "Failed to fetch social media links" },
      { status: 500 }
    );
  }
}

export const PUT = withAdmin(async (request: NextRequest) => {
  try {
    const data = await request.json();
    const updatedLinks = await updateSocialLinks(data);
    return Response.json(updatedLinks);
  } catch (error) {
    console.error("Error updating social links:", error);
    return handleApiError(error);
  }
});
