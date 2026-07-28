import { NextRequest } from "next/server";
import { getCustomReport } from "@/features/reports/server/report.server";
import { withAdmin } from "@/shared/lib/with-admin";
import { handleApiError } from "@/shared/lib/handle-api-error";

export const GET = withAdmin(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const report = await getCustomReport({
      reportType: searchParams.get("reportType") || undefined,
      timeframe: searchParams.get("timeframe") || undefined,
      format: searchParams.get("format") || undefined,
    });
    return Response.json(report);
  } catch (error) {
    return handleApiError(error);
  }
});
