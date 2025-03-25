import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId } = params;
    const prevStatus = await getOrderStatus(orderId);

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID est requis" },
        { status: 400 }
      );
    }

    // Update the order with new status
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: body.status,
        isPaid: body.isPaid !== undefined ? body.isPaid : undefined,
      },
      include: {
        orderItems: {
          include: {
            item: true,
          },
        },
      },
    });

    // If status is changed to "delivered" and wasn't previously, update stock
    if (body.status === "delivered" && prevStatus !== "delivered") {
      await updateProductStock(order.orderItems);
    }

    // Format the order to match frontend expectations
    const formattedOrder = {
      ...order,
      items: order.orderItems.map((orderItem) => ({
        ...orderItem.item,
        quantity: orderItem.quantity,
        price: orderItem.price,
      })),
    };

    return NextResponse.json(
      { order: formattedOrder, success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("[ORDER_PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update order", success: false },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Get the current status of an order
async function getOrderStatus(orderId: string): Promise<string | null> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    });
    return order?.status || null;
  } catch (error) {
    console.error("Error fetching order status:", error);
    return null;
  }
}

// Update product stock when an order is delivered
async function updateProductStock(orderItems: any[]) {
  try {
    for (const orderItem of orderItems) {
      const item = orderItem.item;

      // Reduce the stock by the quantity ordered
      if (item) {
        await prisma.item.update({
          where: { id: item.id },
          data: {
            quantity: Math.max(0, item.quantity - orderItem.quantity),
            // If stock is 0, you might want to mark it as out of stock
            isPublished: item.quantity - orderItem.quantity > 0,
          },
        });

        console.log(
          `Updated stock for ${item.name}: from ${item.quantity} to ${Math.max(
            0,
            item.quantity - orderItem.quantity
          )}`
        );
      }
    }
  } catch (error) {
    console.error("Error updating product stock:", error);
    throw error;
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { orderId } = params;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID est requis" },
        { status: 400 }
      );
    }

    await prisma.order.delete({
      where: { id: orderId },
    });

    return NextResponse.json({ message: "Order deleted" }, { status: 200 });
  } catch (error) {
    console.error("[ORDER_DELETE]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { orderId } = params;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID est requis" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
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
        user: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Format the order to match frontend expectations
    const formattedOrder = {
      ...order,
      items: order.orderItems.map((orderItem) => ({
        ...orderItem.item,
        quantity: orderItem.quantity,
        price: orderItem.price,
      })),
    };

    return NextResponse.json(formattedOrder, { status: 200 });
  } catch (error) {
    console.error("[ORDER_GET]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
