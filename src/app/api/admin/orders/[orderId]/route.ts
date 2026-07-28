import { NextResponse } from "next/server";
import { updateOrderSchema } from "@/features/orders/validations/order.schema";
import {
  deleteAdminOrder,
  getAdminOrderById,
  updateAdminOrder,
} from "@/features/orders/server/order.server";
import { withAdmin } from "@/shared/lib/with-admin";
import { handleApiError } from "@/shared/lib/handle-api-error";

type RouteContext = {
  params: Promise<{ orderId: string }>;
};

export const GET = withAdmin<RouteContext>(async (_req, { params }) => {
  const { orderId } = await params;
  const order = await getAdminOrderById(orderId);

  return NextResponse.json(order);
});

export const PATCH = withAdmin<RouteContext>(async (req, { params }) => {
  try {
    const { orderId } = await params;
    const body = updateOrderSchema.parse(await req.json());
    const order = await updateAdminOrder(orderId, body);

    return NextResponse.json({ order, success: true });
  } catch (error) {
    return handleApiError(error);
  }
});

export const DELETE = withAdmin<RouteContext>(async (_req, { params }) => {
  const { orderId } = await params;
  await deleteAdminOrder(orderId);

  return NextResponse.json({ message: "Order deleted" });
});
