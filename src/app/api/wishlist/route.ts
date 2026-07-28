import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { addToWishlistSchema } from "@/features/wishlist/validations/wishlist.schema";
import {
  addItem,
  getWishlist,
  removeItem,
} from "@/features/wishlist/server/wishlist.server";
import { withAuth } from "@/shared/lib/with-auth";
import {
  handleApiError,
  NotFoundError,
} from "@/shared/lib/handle-api-error";

export const GET = withAuth(async (_req, { session }) => {
  const items = await getWishlist(session.user.id);
  return NextResponse.json({ items });
});

export const POST = withAuth(async (req, { session }) => {
  try {
    const body = addToWishlistSchema.parse(await req.json());
    const result = await addItem(session.user.id, body.itemId);

    if (result.alreadyExists) {
      return NextResponse.json({
        message: "L'article est déjà dans votre liste de souhaits",
        success: true,
      });
    }

    return NextResponse.json({
      message: "Article ajouté à votre liste de souhaits",
      success: true,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "L'ID de l'article est requis", success: false },
        { status: 400 }
      );
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { error: error.message, success: false },
        { status: 404 }
      );
    }

    return handleApiError(error);
  }
});

export const DELETE = withAuth(async (req, { session }) => {
  try {
    const itemId = new URL(req.url).searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        { error: "L'ID de l'article est requis", success: false },
        { status: 400 }
      );
    }

    await removeItem(session.user.id, itemId);

    return NextResponse.json({
      message: "Article supprimé de votre liste de souhaits",
      success: true,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { error: error.message, success: false },
        { status: 404 }
      );
    }

    return handleApiError(error);
  }
});
