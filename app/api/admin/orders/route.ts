import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user.isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const orders = await prisma.order.findMany({
      include: {
        user: true,
        items: true,
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
