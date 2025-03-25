import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autorisé", success: false },
        { status: 401 }
      );
    }

    // Get the user's cart with items
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        cartItems: {
          include: {
            item: true,
          },
        },
      },
    });

    if (!cart || !cart.cartItems.length) {
      return NextResponse.json(
        { error: "Le panier est vide", success: false },
        { status: 400 }
      );
    }

    // Calculate total order amount
    const total = cart.cartItems.reduce(
      (sum, cartItem) => sum + cartItem.item.price * cartItem.quantity,
      0
    );

    // Create a new order
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        total,
        status: "pending",
        orderItems: {
          create: cart.cartItems.map((cartItem) => ({
            itemId: cartItem.itemId,
            quantity: cartItem.quantity,
            price: cartItem.item.price,
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            item: {
              include: {
                images: true,
                category: true,
                brand: true,
                options: true,
              },
            },
          },
        },
        user: true,
      },
    });

    // Clear the user's cart
    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    // Format the response to match the expected structure
    const formattedOrder = {
      ...order,
      items: order.orderItems.map((orderItem) => ({
        ...orderItem.item,
        quantity: orderItem.quantity,
        price: orderItem.price,
        orderItemId: orderItem.id,
      })),
    };

    return NextResponse.json({ order: formattedOrder, success: true });
  } catch (error) {
    console.error("[ORDER_CREATE]", error);
    return NextResponse.json(
      { error: "Échec de la création de la commande", success: false },
      { status: 500 }
    );
  }
}
