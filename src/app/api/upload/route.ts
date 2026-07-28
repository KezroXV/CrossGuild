import { uploadImage } from "@/shared/services/upload.service";
import { withAuth } from "@/shared/lib/with-auth";
import { handleApiError } from "@/shared/lib/handle-api-error";

export const POST = withAuth(async (request) => {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const url = await uploadImage(file);

    return Response.json({
      success: true,
      url,
    });
  } catch (error) {
    return handleApiError(error);
  }
});
