import { NextRequest } from "next/server";
import {
  createOfferFromFormData,
  getOffers,
} from "@/features/cms/server/offers.server";
import { withAdmin } from "@/shared/lib/with-admin";
import { handleApiError } from "@/shared/lib/handle-api-error";

export async function GET() {
  try {
    const offers = await getOffers();
    return Response.json(offers);
  } catch (error) {
    console.error("Error fetching offers:", error);
    return Response.json({ error: "Failed to fetch offers" }, { status: 500 });
  }
}

export const POST = withAdmin(async (request: NextRequest) => {
  try {
    const formData = await request.formData();
    const newOffer = await createOfferFromFormData(formData);
    return Response.json(newOffer);
  } catch (error) {
    console.error("Error creating offer:", error);
    return handleApiError(error);
  }
});
