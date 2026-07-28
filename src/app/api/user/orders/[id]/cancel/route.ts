import { NextResponse } from "next/server";
import { cancelOrder } from "@/features/orders/server/order.server";
import { withAuth } from "@/shared/lib/with-auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const PUT = withAuth<RouteContext>(async (_req, { session, params }) => {
  const { id: orderId } = await params;
  const order = await cancelOrder(session.user.id, orderId);

  return NextResponse.json({ success: true, order });
});
