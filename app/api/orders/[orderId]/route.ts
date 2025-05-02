import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = params;

    // Adaptation pour le nouveau modèle avec OrderItem
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId: session.user.id, // Ensure users can only access their own orders
      },
      include: {
        orderItems: {
          include: {
            item: {
              include: {
                images: true,
                category: true,
                brand: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Format de réponse adapté pour la migration
    const formattedOrder = {
      ...order,
      city: order.city, // <-- Ajoute explicitement la ville ici si besoin
      items: order.orderItems.map((orderItem) => ({
        ...orderItem.item,
        quantity: orderItem.quantity,
        price: orderItem.price,
        orderItemId: orderItem.id,
      })),
    };

    return NextResponse.json(formattedOrder);
  } catch (error) {
    console.error("[ORDER_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
