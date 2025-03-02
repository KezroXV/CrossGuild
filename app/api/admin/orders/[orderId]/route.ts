import prisma from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const body = await req.json();
    const { orderId } = params;

    if (!orderId) {
      return new NextResponse("Order ID est requis", { status: 400 });
    }

    const order = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        isPaid: body.isPaid,
      },
    });

    return NextResponse.json({ order, success: true });
  } catch (error) {
    console.log("[ORDER_PATCH]", error);
    return NextResponse.json(
      {
        error: "Failed to update order",
        success: false,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const { orderId } = params;

    if (!orderId) {
      return new NextResponse("Order ID est requis", { status: 400 });
    }

    const order = await prisma.order.delete({
      where: {
        id: orderId,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.log("[ORDER_DELETE]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const { orderId } = params;

    if (!orderId) {
      return new NextResponse("Order ID est requis", { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.log("[ORDER_GET]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
