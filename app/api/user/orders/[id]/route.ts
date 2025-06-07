import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const orderId = params.id;

    // Get order details
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId, // Ensure the order belongs to the user
      },
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
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Format order to match the expected structure in the frontend
    const formattedOrder = {
      id: order.id,
      orderNumber: order.id.slice(-8).toUpperCase(), // Générer un numéro de commande basé sur l'ID
      createdAt: order.createdAt,
      status: order.status,
      totalAmount: order.total, // Assurez-vous d'utiliser le bon champ
      items: order.orderItems.map((orderItem) => ({
        id: orderItem.item.id,
        name: orderItem.item.name,
        price: orderItem.price,
        quantity: orderItem.quantity,
        images: orderItem.item.images,
      })),
    };

    return NextResponse.json(formattedOrder);
  } catch (error) {
    console.error("[USER_ORDER_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch order details" },
      { status: 500 }
    );
  }
}
