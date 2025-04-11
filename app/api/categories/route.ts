import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { items: true },
        },
        items: {
          take: 4,
          select: {
            id: true,
            name: true,
            images: {
              take: 1,
              select: {
                url: true,
              },
            },
          },
        },
      },
    });

    const formattedCategories = categories.map((category) => ({
      id: category.id,
      name: category.name,
      image: category.image || "/images/placeholder.jpg",
      description: category.description,
      itemCount: category._count.items,
      recentItems: category.items.map((item) => ({
        id: item.id,
        name: item.name,
        image: item.images[0]?.url || "/images/placeholder.jpg",
      })),
    }));

    return NextResponse.json(formattedCategories);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
