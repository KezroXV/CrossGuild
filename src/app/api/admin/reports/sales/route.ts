import { NextRequest } from "next/server";
import { getSalesReport } from "@/features/reports/server/report.server";
import { withAdmin } from "@/shared/lib/with-admin";
import { handleApiError } from "@/shared/lib/handle-api-error";

export const GET = withAdmin(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const report = await getSalesReport({
      timeframe: searchParams.get("timeframe") || undefined,
      from: searchParams.get("from"),
      to: searchParams.get("to"),
    });
    return Response.json(report);
  } catch (error) {
    return handleApiError(error);
  }
});
