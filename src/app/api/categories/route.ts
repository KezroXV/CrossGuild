import { NextResponse } from "next/server";
import { getPublicCategories } from "@/features/products/server/category.server";
import { handleApiError } from "@/shared/lib/handle-api-error";

export async function GET() {
  try {
    const categories = await getPublicCategories();
    return NextResponse.json(categories);
  } catch (error) {
    return handleApiError(error);
  }
}
