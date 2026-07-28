import { NextResponse } from "next/server";
import { relatedProductsQuerySchema } from "@/features/products/validations/product.schema";
import { getRelatedProducts } from "@/features/products/server/product.server";
import { handleApiError } from "@/shared/lib/handle-api-error";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = relatedProductsQuerySchema.parse({
      categoryId: searchParams.get("categoryId") ?? undefined,
      excludeId: searchParams.get("excludeId") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    const products = await getRelatedProducts(query);
    return NextResponse.json({ products });
  } catch (error) {
    return handleApiError(error);
  }
}
