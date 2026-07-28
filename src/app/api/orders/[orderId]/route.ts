import { NextResponse } from "next/server";
import { getOrderById } from "@/features/orders/server/order.server";
import { withAuth } from "@/shared/lib/with-auth";

type RouteContext = {
  params: Promise<{ orderId: string }>;
};

export const GET = withAuth<RouteContext>(async (_req, { session, params }) => {
  const { orderId } = await params;
  const order = await getOrderById(session.user.id, orderId);

  return NextResponse.json(order);
});
