import { NextResponse } from "next/server";
import { uploadProfileImage } from "@/features/auth/server/profile.server";
import { withAuth } from "@/shared/lib/with-auth";
import { handleApiError } from "@/shared/lib/handle-api-error";

export const POST = withAuth(async (req, { session }) => {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    const result = await uploadProfileImage(session.user.id, file);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
});
