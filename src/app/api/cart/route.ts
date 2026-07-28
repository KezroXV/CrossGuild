import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  addToCartSchema,
  updateCartItemSchema,
} from "@/features/cart/validations/cart.schema";
import {
  addToCart,
  getCart,
  removeFromCart,
  updateCartItem,
} from "@/features/cart/server/cart.server";
import { withAuth } from "@/shared/lib/with-auth";
import {
  handleApiError,
  NotFoundError,
} from "@/shared/lib/handle-api-error";

export const GET = withAuth(async (_req, { session }) => {
  const items = await getCart(session.user.id);
  return NextResponse.json({ items });
});

export const POST = withAuth(async (req, { session }) => {
  try {
    const body = addToCartSchema.parse(await req.json());
    await addToCart(session.user.id, body.itemId, body.quantity);
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

export const DELETE = withAuth(async (req, { session }) => {
  try {
    const itemId = new URL(req.url).searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    await removeFromCart(session.user.id, itemId);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return handleApiError(error);
  }
});

export const PATCH = withAuth(async (req, { session }) => {
  try {
    const body = updateCartItemSchema.parse(await req.json());
    await updateCartItem(session.user.id, body.itemId, body.quantity);
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
