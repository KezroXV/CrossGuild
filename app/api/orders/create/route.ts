import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autorisé", success: false },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { city } = body;

    if (!city) {
      return NextResponse.json(
        { error: "La ville est requise", success: false },
        { status: 400 }
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
        city, // Ajout de la ville ici
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

    // Update the product quantities and topSelling stats
    await Promise.all(
      cart.cartItems.map(async (cartItem) => {
        // Update the original product stock and increase topSelling counter
        await prisma.item.update({
          where: { id: cartItem.itemId },
          data: {
            // Decrease the available quantity
            quantity: Math.max(0, cartItem.item.quantity - cartItem.quantity),
            // Increase the topSelling counter
            topSelling: cartItem.item.topSelling + cartItem.quantity,
          },
        });
      })
    );

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
    console.error("[ORDER_CREATE]", error ?? "Unknown error");
    return NextResponse.json(
      { error: "Échec de la création de la commande", success: false },
      { status: 500 }
    );
  }
}
