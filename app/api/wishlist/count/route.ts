import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ count: 0 });
    }

    // Count the number of items in the user's wishlist
    const count = await prisma.wishlistItem.count({
      where: { userId: session.user.id },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("[WISHLIST_COUNT_GET]", error);
    return NextResponse.json({ count: 0 });
  }
}
