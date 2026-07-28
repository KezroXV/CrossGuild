import { NextResponse } from "next/server";
import {
  deleteBrand,
  updateBrandFromFormData,
} from "@/features/products/server/brand.server";
import { withAdmin } from "@/shared/lib/with-admin";
import { handleApiError } from "@/shared/lib/handle-api-error";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const PUT = withAdmin<RouteContext>(async (request, { params }) => {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const brand = await updateBrandFromFormData(id, formData);
    return NextResponse.json(brand);
  } catch (error) {
    return handleApiError(error);
  }
});

export const DELETE = withAdmin<RouteContext>(async (_request, { params }) => {
  try {
    const { id } = await params;
    await deleteBrand(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
});
