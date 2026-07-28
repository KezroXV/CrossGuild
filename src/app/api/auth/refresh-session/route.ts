import { withAuth } from "@/shared/lib/with-auth";
import { apiSuccess } from "@/shared/lib/api-response";
import { refreshSession } from "@/features/auth/server/auth.server";

export const GET = withAuth(async (_req, { session }) => {
  const user = await refreshSession(session.user.id);
  return apiSuccess({ user });
});
