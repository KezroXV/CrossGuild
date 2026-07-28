import { NextResponse } from "next/server";
import { uploadImage } from "@/shared/lib/upload.server";
import { withAuth } from "@/shared/lib/with-auth";
import { handleApiError } from "@/shared/lib/handle-api-error";

export const POST = withAuth(async (request) => {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const url = await uploadImage(file);

    return NextResponse.json({
      success: true,
      url,
    });
  } catch (error) {
    return handleApiError(error);
  }
});
