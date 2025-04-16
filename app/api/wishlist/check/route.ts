import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ inWishlist: false });
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    // Check if the item is in the user's wishlist
    const wishlistItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_itemId: {
          userId: session.user.id,
          itemId,
        },
      },
    });

    return NextResponse.json({ inWishlist: !!wishlistItem });
  } catch (error) {
    console.error("[WISHLIST_CHECK_GET]", error);
    return NextResponse.json({ inWishlist: false });
  }
}
