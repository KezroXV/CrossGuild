import { NextResponse } from "next/server";
import { productListQuerySchema } from "@/features/products/validations/product.schema";
import { getPublishedProducts } from "@/features/products/server/product.server";
import { handleApiError } from "@/shared/lib/handle-api-error";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = productListQuerySchema.parse({
      sort: searchParams.get("sort") ?? undefined,
    });

    const products = await getPublishedProducts(query);
    return NextResponse.json(products);
  } catch (error) {
    return handleApiError(error);
  }
}
