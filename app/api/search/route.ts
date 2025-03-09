import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ products: [] });
  }

  try {
    const products = await prisma.item.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      include: {
        images: true,
      },
      take: 5,
    });

    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to search products" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
