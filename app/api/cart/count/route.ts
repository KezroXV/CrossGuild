import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ count: 0 });
    }

    // Check if the user has a cart
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        cartItems: true,
      },
    });

    if (!cart) {
      return NextResponse.json({ count: 0 });
    }

    // Calculate total number of items (sum of quantities)
    const totalItems = cart.cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    return NextResponse.json({ count: totalItems });
  } catch (error) {
    console.error("[CART_COUNT_GET]", error);
    return NextResponse.json({ count: 0 });
  }
}
