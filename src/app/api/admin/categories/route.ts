import {
  createCategorySchema,
  deleteCategorySchema,
  updateCategorySchema,
} from "@/features/products/validations/category.schema";
import {
  createCategory,
  deleteCategory,
  getAdminCategories,
  updateCategory,
} from "@/features/products/server/category.server";
import { withAdmin } from "@/shared/lib/with-admin";
import { handleApiError } from "@/shared/lib/handle-api-error";

export const GET = withAdmin(async () => {
  try {
    const categories = await getAdminCategories();
    return Response.json({ categories }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
});

export const POST = withAdmin(async (req) => {
  try {
    const input = createCategorySchema.parse(await req.json());
    const category = await createCategory(input);
    return Response.json({ category }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
});

export const DELETE = withAdmin(async (req) => {
  try {
    const { id } = deleteCategorySchema.parse(await req.json());
    await deleteCategory(id);
    return Response.json({ message: "Category deleted" }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
});

export const PUT = withAdmin(async (req) => {
  try {
    const input = updateCategorySchema.parse(await req.json());
    const category = await updateCategory(input);
    return Response.json({ category }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
});
