import { NextRequest } from "next/server";
import {
  getHeroContent,
  updateHeroFromFormData,
} from "@/features/cms/server/hero.server";
import { withAdmin } from "@/shared/lib/with-admin";
import { handleApiError } from "@/shared/lib/handle-api-error";

export async function GET() {
  try {
    const heroContent = await getHeroContent();
    return Response.json(heroContent);
  } catch (error) {
    console.error("Error fetching hero content:", error);
    return Response.json(
      { error: "Failed to fetch hero content" },
      { status: 500 }
    );
  }
}

export const PUT = withAdmin(async (request: NextRequest) => {
  try {
    const formData = await request.formData();
    const updatedHeroContent = await updateHeroFromFormData(formData);
    return Response.json(updatedHeroContent);
  } catch (error) {
    console.error("Error updating hero content:", error);
    return handleApiError(error);
  }
});
