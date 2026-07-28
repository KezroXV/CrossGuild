import { NextResponse } from "next/server";
import { searchQuerySchema } from "@/features/products/validations/product.schema";
import { searchProducts } from "@/features/products/server/search.server";
import { handleApiError } from "@/shared/lib/handle-api-error";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { q } = searchQuerySchema.parse({
      q: searchParams.get("q") ?? undefined,
    });

    const products = await searchProducts(q ?? "");
    return NextResponse.json({ products });
  } catch (error) {
    return handleApiError(error);
  }
}
