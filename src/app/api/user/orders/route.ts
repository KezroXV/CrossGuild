import { NextResponse } from "next/server";
import { userOrdersPaginationSchema } from "@/features/orders/validations/order.schema";
import { getUserOrders } from "@/features/orders/server/order.server";
import { withAuth } from "@/shared/lib/with-auth";

export const GET = withAuth(async (req, { session }) => {
  const { searchParams } = new URL(req.url);
  const { page, pageSize } = userOrdersPaginationSchema.parse({
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  });

  const result = await getUserOrders(session.user.id, page, pageSize);

  return NextResponse.json(result);
});
