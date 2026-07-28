import { NextResponse } from "next/server";
import { adminOrdersPaginationSchema } from "@/features/orders/validations/order.schema";
import { getAdminOrders } from "@/features/orders/server/order.server";
import { withAdmin } from "@/shared/lib/with-admin";

export const GET = withAdmin(async (req) => {
  const { searchParams } = new URL(req.url);
  const { page, pageSize } = adminOrdersPaginationSchema.parse({
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  });

  const result = await getAdminOrders(page, pageSize);

  return NextResponse.json(result);
});
