import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get pagination parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    // Calculate skip value for pagination
    const skip = (page - 1) * pageSize;

    // Get total count of orders for pagination
    const totalOrders = await prisma.order.count();
    const totalPages = Math.ceil(totalOrders / pageSize);

    // Get paginated orders with the new schema structure
    const orders = await prisma.order.findMany({
      skip,
      take: pageSize,
      include: {
        user: true,
        orderItems: {
          include: {
            item: {
              include: {
                images: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format orders to match the expected structure in the frontend
    const formattedOrders = orders.map((order) => ({
      ...order,
      items: order.orderItems.map((orderItem) => ({
        ...orderItem.item,
        quantity: orderItem.quantity,
        price: orderItem.price,
      })),
    }));

    return NextResponse.json({
      orders: formattedOrders,
      currentPage: page,
      totalPages,
      totalOrders,
    });
  } catch (error) {
    console.error("[ADMIN_ORDERS_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
