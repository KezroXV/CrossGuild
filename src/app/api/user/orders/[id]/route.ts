import { NextResponse } from "next/server";
import { getUserOrderById } from "@/features/orders/server/order.server";
import { withAuth } from "@/shared/lib/with-auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const GET = withAuth<RouteContext>(async (_req, { session, params }) => {
  const { id: orderId } = await params;
  const order = await getUserOrderById(session.user.id, orderId);

  return NextResponse.json(order);
});
