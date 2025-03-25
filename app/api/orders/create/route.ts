import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Get the user's cart with items
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            images: true,
            category: true,
            brand: true,
            options: true,
          },
        },
      },
    });

    if (!cart || !cart.items.length) {
      return NextResponse.json(
        { error: "Le panier est vide" },
        { status: 400 }
      );
    }

    // Calculate total order amount
    const total = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Create a new order
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        total,
        status: "pending",
      },
    });

    // Update item references to be part of the order instead of the cart
    await Promise.all(
      cart.items.map((item) =>
        prisma.item.update({
          where: { id: item.id },
          data: {
            orderId: order.id,
            cartId: null,
          },
        })
      )
    );

    // Get the updated order
    const updatedOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: true,
        user: true,
      },
    });

    return NextResponse.json({ order: updatedOrder, success: true });
  } catch (error) {
    console.error("[ORDER_CREATE]", error);
    return NextResponse.json(
      { error: "Échec de la création de la commande", success: false },
      { status: 500 }
    );
  }
}
