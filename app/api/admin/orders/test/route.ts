import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user.isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { itemIds } = body;

    // Récupérer les items sélectionnés
    const items = await prisma.item.findMany({
      where: {
        id: {
          in: itemIds,
        },
      },
    });

    // Calculer le total
    const total = items.reduce((sum, item) => sum + item.price, 0);

    // Créer la commande avec les items existants
    const order = await prisma.order.create({
      data: {
        userId: session.user.id!,
        total,
        status: "pending",
        items: {
          connect: itemIds.map((id: string) => ({ id })),
        },
      },
      include: {
        user: true,
        items: true,
      },
    });

    return NextResponse.json({
      message: "Test order created successfully",
      order,
    });
  } catch (error) {
    console.error("[TEST_ORDER_CREATE]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// Route pour récupérer les items disponibles
export async function GET() {
  try {
    const items = await prisma.item.findMany({
      where: {
        isPublished: true,
      },
      select: {
        id: true,
        name: true,
        price: true,
      },
    });

    return NextResponse.json(items);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
