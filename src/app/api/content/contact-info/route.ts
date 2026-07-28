import { NextRequest } from "next/server";
import {
  getContactInfo,
  isMissingContactInfoTable,
  updateContactInfo,
} from "@/features/cms/server/contact-info.server";
import { withAdmin } from "@/shared/lib/with-admin";
import { handleApiError } from "@/shared/lib/handle-api-error";

export async function GET() {
  try {
    const contactInfo = await getContactInfo();
    return Response.json(contactInfo);
  } catch (error) {
    console.error("Error fetching contact info:", error);

    if (isMissingContactInfoTable(error)) {
      return Response.json(
        {
          error:
            "The ContactInfo table doesn't exist yet. Please run Prisma migrations.",
        },
        { status: 500 }
      );
    }

    return Response.json(
      { error: "Failed to fetch contact information" },
      { status: 500 }
    );
  }
}

export const PUT = withAdmin(async (request: NextRequest) => {
  try {
    const data = await request.json();
    const updatedInfo = await updateContactInfo(data);
    return Response.json(updatedInfo);
  } catch (error) {
    console.error("Error updating contact info:", error);
    return handleApiError(error);
  }
});
