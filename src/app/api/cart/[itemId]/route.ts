import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { updateCartItemQuantitySchema } from "@/features/cart/validations/cart.schema";
import {
  removeFromCart,
  updateCartItem,
} from "@/features/cart/server/cart.server";
import { withAuth } from "@/shared/lib/with-auth";
import {
  handleApiError,
  NotFoundError,
} from "@/shared/lib/handle-api-error";

type RouteContext = {
  params: Promise<{ itemId: string }>;
};

export const PATCH = withAuth<RouteContext>(async (req, { session, params }) => {
  try {
    const { itemId } = await params;
    const { quantity } = updateCartItemQuantitySchema.parse(await req.json());

    await updateCartItem(session.user.id, itemId, quantity);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.format() },
        { status: 400 }
      );
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return handleApiError(error);
  }
});

export const DELETE = withAuth<RouteContext>(async (_req, { session, params }) => {
  try {
    const { itemId } = await params;
    await removeFromCart(session.user.id, itemId);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return handleApiError(error);
  }
});
