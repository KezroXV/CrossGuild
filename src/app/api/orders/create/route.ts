import { NextResponse } from "next/server";
import { createOrderSchema } from "@/features/orders/validations/order.schema";
import { createOrder } from "@/features/orders/server/order.server";
import { withAuth } from "@/shared/lib/with-auth";
import { handleApiError } from "@/shared/lib/handle-api-error";

export const POST = withAuth(async (req, { session }) => {
  try {
    const { deliveryInfo } = createOrderSchema.parse(await req.json());
    const order = await createOrder(session.user.id, deliveryInfo);

    return NextResponse.json({ order, success: true });
  } catch (error) {
    return handleApiError(error);
  }
});
