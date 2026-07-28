import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/shared/lib/with-admin";
import prisma from "@/shared/lib/prisma";

export const GET = withAdmin(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    const skip = (page - 1) * pageSize;

    const totalOrders = await prisma.order.count();
    const totalPages = Math.ceil(totalOrders / pageSize);

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
});
