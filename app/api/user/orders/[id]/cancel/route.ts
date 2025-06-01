import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    // Fix the params issue by ensuring params is resolved
    const { id: orderId } = await Promise.resolve(params);

    // Check if the order exists and belongs to the user
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if the order is in a status that can be cancelled
    // Note: status values are case-sensitive, check your database for exact values
    if (
      order.status.toLowerCase() !== "pending" &&
      order.status.toLowerCase() !== "processing"
    ) {
      return NextResponse.json(
        { error: "This order cannot be cancelled anymore" },
        { status: 400 }
      );
    }

    // Update the order status to CANCELLED
    const updatedOrder = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: "CANCELLED", // Make sure this matches your database enum case
      },
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("[CANCEL_ORDER]", error);
    return NextResponse.json(
      { error: "Failed to cancel order" },
      { status: 500 }
    );
  }
}
