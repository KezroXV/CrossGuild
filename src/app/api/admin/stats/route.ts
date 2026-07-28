import { getAdminStats } from "@/features/admin/server/stats.server";
import { withAdmin } from "@/shared/lib/with-admin";
import { handleApiError } from "@/shared/lib/handle-api-error";

export const GET = withAdmin(async () => {
  try {
    const stats = await getAdminStats();
    return Response.json(stats);
  } catch (error) {
    return handleApiError(error);
  }
});
