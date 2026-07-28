import { NextResponse } from "next/server";
import { createBrandFromFormData, getBrands } from "@/features/products/server/brand.server";
import { withAdmin } from "@/shared/lib/with-admin";
import { handleApiError } from "@/shared/lib/handle-api-error";

export async function GET() {
  try {
    const brands = await getBrands();
    return NextResponse.json(brands);
  } catch (error) {
    return handleApiError(error);
  }
}

export const POST = withAdmin(async (request) => {
  try {
    const formData = await request.formData();
    const brand = await createBrandFromFormData(formData);
    return NextResponse.json(brand);
  } catch (error) {
    return handleApiError(error);
  }
});
