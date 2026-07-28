import { NextResponse } from "next/server";
import {
  adminProductsQuerySchema,
  createProductSchema,
  deleteProductSchema,
  updateProductSchema,
} from "@/features/products/validations/product.schema";
import {
  createProduct,
  deleteProduct,
  getAdminProducts,
  updateProduct,
} from "@/features/products/server/product.server";
import { withAdmin } from "@/shared/lib/with-admin";
import { handleApiError } from "@/shared/lib/handle-api-error";

export const GET = withAdmin(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const query = adminProductsQuerySchema.parse({
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
      order: searchParams.get("order") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    const result = await getAdminProducts(query);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
});

export const POST = withAdmin(async (request) => {
  try {
    const input = createProductSchema.parse(await request.json());
    const product = await createProduct(input);
    return NextResponse.json({ product });
  } catch (error) {
    return handleApiError(error);
  }
});

export const PUT = withAdmin(async (request) => {
  try {
    const input = updateProductSchema.parse(await request.json());
    const product = await updateProduct(input);
    return NextResponse.json({ product });
  } catch (error) {
    return handleApiError(error);
  }
});

export const DELETE = withAdmin(async (request) => {
  try {
    const { id } = deleteProductSchema.parse(await request.json());
    await deleteProduct(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
});
