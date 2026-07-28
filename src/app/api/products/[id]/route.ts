import { NextResponse } from "next/server";
import { getProductById } from "@/features/products/server/product.server";
import { handleApiError } from "@/shared/lib/handle-api-error";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await getProductById(params.id);
    return NextResponse.json(product);
  } catch (error) {
    return handleApiError(error);
  }
}
