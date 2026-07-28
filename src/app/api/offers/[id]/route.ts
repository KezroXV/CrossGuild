import { NextRequest } from "next/server";
import {
  deleteOffer,
  updateOfferFromFormData,
} from "@/features/cms/server/offers.server";
import { withAdmin } from "@/shared/lib/with-admin";
import { handleApiError } from "@/shared/lib/handle-api-error";

type RouteContext = { params: Promise<{ id: string }> };

export const PUT = withAdmin<RouteContext>(async (request: NextRequest, { params }) => {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const updatedOffer = await updateOfferFromFormData(id, formData);
    return Response.json(updatedOffer);
  } catch (error) {
    console.error("Error updating offer:", error);
    return handleApiError(error);
  }
});

export const DELETE = withAdmin<RouteContext>(async (_request, { params }) => {
  try {
    const { id } = await params;
    const result = await deleteOffer(id);
    return Response.json(result);
  } catch (error) {
    console.error("Error deleting offer:", error);
    return handleApiError(error);
  }
});
