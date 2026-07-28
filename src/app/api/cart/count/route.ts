import { NextResponse } from "next/server";
import { auth } from "@/shared/lib/auth";
import { getCartCount } from "@/features/cart/server/cart.server";
import { handleApiError } from "@/shared/lib/handle-api-error";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ count: 0 });
    }

    const count = await getCartCount(session.user.id);
    return NextResponse.json({ count });
  } catch (error) {
    console.error("[CART_COUNT_GET]", error);
    return handleApiError(error);
  }
}
