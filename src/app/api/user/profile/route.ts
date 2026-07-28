import { NextResponse } from "next/server";
import {
  getProfile,
  updateProfile,
} from "@/features/auth/server/profile.server";
import { withAuth } from "@/shared/lib/with-auth";
import { handleApiError } from "@/shared/lib/handle-api-error";

export const GET = withAuth(async (_req, { session }) => {
  try {
    const user = await getProfile(session.user.id);
    return NextResponse.json(user);
  } catch (error) {
    return handleApiError(error);
  }
});

export const PUT = withAuth(async (req, { session }) => {
  try {
    const body = await req.json();
    const updatedUser = await updateProfile(
      session.user.id,
      body,
      session.user.email!
    );
    return NextResponse.json(updatedUser);
  } catch (error) {
    return handleApiError(error);
  }
});
