import { NextResponse } from "next/server";
import { updatePassword } from "@/features/auth/server/profile.server";
import { withAuth } from "@/shared/lib/with-auth";
import { handleApiError } from "@/shared/lib/handle-api-error";

export const PUT = withAuth(async (req, { session }) => {
  try {
    const { currentPassword, newPassword } = await req.json();
    const result = await updatePassword(
      session.user.id,
      currentPassword,
      newPassword
    );
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
});
