import { NextResponse } from "next/server";
import getServerSession from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId } = params;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID est requis" },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { isPaid: body.isPaid },
    });

    return NextResponse.json({ order, success: true }, { status: 200 });
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

export async function DELETE(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

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
    const session = await getServerSession(authOptions);

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

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: { product: true },
        },
      },
    });

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error("[ORDER_GET]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
