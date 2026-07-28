/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/shared/lib/with-admin";
import prisma from "@/shared/lib/prisma";

export const PATCH = withAdmin(
  async (req: NextRequest, context: { params: Promise<{ orderId: string }> }) => {
    try {
      const body = await req.json();
      const { orderId } = await context.params;
      const prevStatus = await getOrderStatus(orderId);

      if (!orderId) {
        return NextResponse.json(
          { error: "Order ID est requis" },
          { status: 400 }
        );
      }

      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: body.status,
          ...(body.isPaid !== undefined && { isPaid: body.isPaid }),
        },
        include: {
          orderItems: {
            include: {
              item: true,
            },
          },
        },
      });

      if (body.status === "delivered" && prevStatus !== "delivered") {
        await updateProductStock(order.orderItems);
      }

      if (
        body.status === "cancelled" &&
        prevStatus !== "cancelled" &&
        prevStatus !== "pending"
      ) {
        await restoreProductStock(order.orderItems);
      }

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
    }
  }
);

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

async function updateProductStock(orderItems: any[]) {
  try {
    for (const orderItem of orderItems) {
      const item = orderItem.item;

      if (item) {
        await prisma.item.update({
          where: { id: item.id },
          data: {
            quantity: Math.max(0, item.quantity - orderItem.quantity),
            topSelling: item.topSelling + orderItem.quantity,
            isPublished: item.quantity - orderItem.quantity > 0,
          },
        });

        console.log(
          `Updated stock for ${item.name}: from ${item.quantity} to ${Math.max(
            0,
            item.quantity - orderItem.quantity
          )}, topSelling increased to ${item.topSelling + orderItem.quantity}`
        );
      }
    }
  } catch (error) {
    console.error("Error updating product stock:", error);
    throw error;
  }
}

async function restoreProductStock(orderItems: any[]) {
  try {
    for (const orderItem of orderItems) {
      const item = orderItem.item;

      if (item) {
        await prisma.item.update({
          where: { id: item.id },
          data: {
            quantity: item.quantity + orderItem.quantity,
            topSelling: Math.max(0, item.topSelling - orderItem.quantity),
            isPublished: true,
          },
        });

        console.log(
          `Restored stock for ${item.name}: from ${item.quantity} to ${
            item.quantity + orderItem.quantity
          }, topSelling decreased to ${Math.max(
            0,
            item.topSelling - orderItem.quantity
          )}`
        );
      }
    }
  } catch (error) {
    console.error("Error restoring product stock:", error);
    throw error;
  }
}

export const DELETE = withAdmin(
  async (_req: NextRequest, context: { params: Promise<{ orderId: string }> }) => {
    try {
      const { orderId } = await context.params;

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
    }
  }
);

export const GET = withAdmin(
  async (_request: NextRequest, context: { params: Promise<{ orderId: string }> }) => {
    try {
      const { orderId } = await context.params;

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
    }
  }
);
