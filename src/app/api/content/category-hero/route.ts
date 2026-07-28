import { NextRequest } from "next/server";
import {
  getCategoryHeroContent,
  updateCategoryHeroFromFormData,
} from "@/features/cms/server/category-hero.server";
import { withAdmin } from "@/shared/lib/with-admin";
import { handleApiError } from "@/shared/lib/handle-api-error";

export async function GET() {
  try {
    const categoryHeroContent = await getCategoryHeroContent();
    return Response.json(categoryHeroContent);
  } catch (error) {
    console.error("Error fetching category hero content:", error);
    return Response.json(
      { error: "Failed to fetch category hero content" },
      { status: 500 }
    );
  }
}

export const PUT = withAdmin(async (request: NextRequest) => {
  try {
    const formData = await request.formData();
    const updatedCategoryHeroContent =
      await updateCategoryHeroFromFormData(formData);
    return Response.json(updatedCategoryHeroContent);
  } catch (error) {
    console.error("Error updating category hero content:", error);
    return handleApiError(error);
  }
});
