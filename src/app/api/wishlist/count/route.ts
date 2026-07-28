import { NextResponse } from "next/server";
import { auth } from "@/shared/lib/auth";
import { getCount } from "@/features/wishlist/server/wishlist.server";
import { handleApiError } from "@/shared/lib/handle-api-error";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ count: 0 });
    }

    const count = await getCount(session.user.id);
    return NextResponse.json({ count });
  } catch (error) {
    console.error("[WISHLIST_COUNT_GET]", error);
    return NextResponse.json({ count: 0 });
  }
}
