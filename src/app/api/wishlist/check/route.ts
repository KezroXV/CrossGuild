import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/shared/lib/auth";
import { isInWishlist } from "@/features/wishlist/server/wishlist.server";
import { wishlistItemIdQuerySchema } from "@/features/wishlist/validations/wishlist.schema";

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ inWishlist: false });
    }

    const query = wishlistItemIdQuerySchema.parse({
      itemId: new URL(req.url).searchParams.get("itemId"),
    });

    const inWishlist = await isInWishlist(session.user.id, query.itemId);
    return NextResponse.json({ inWishlist });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    console.error("[WISHLIST_CHECK_GET]", error);
    return NextResponse.json({ inWishlist: false });
  }
}
