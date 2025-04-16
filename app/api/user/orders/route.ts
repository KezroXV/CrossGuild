import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    // Get pagination parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "5");

    // Calculate skip value for pagination
    const skip = (page - 1) * pageSize;

    // Get total count of user orders for pagination
    const totalOrders = await prisma.order.count({
      where: { userId },
    });

    const totalPages = Math.ceil(totalOrders / pageSize);

    // Get paginated orders
    const orders = await prisma.order.findMany({
      where: { userId },
      skip,
      take: pageSize,
      include: {
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
      id: order.id,
      orderNumber: order.id.slice(-8).toUpperCase(), // Générer un numéro de commande basé sur l'ID si non présent
      createdAt: order.createdAt,
      status: order.status,
      totalAmount: order.total, // Assurez-vous d'utiliser le bon champ (total au lieu de totalAmount)
      items: order.orderItems.map((orderItem) => ({
        id: orderItem.item.id,
        name: orderItem.item.name,
        price: orderItem.price,
        quantity: orderItem.quantity,
        images: orderItem.item.images,
      })),
    }));

    return NextResponse.json({
      orders: formattedOrders,
      currentPage: page,
      totalPages,
      totalOrders,
    });
  } catch (error) {
    console.error("[USER_ORDERS_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
