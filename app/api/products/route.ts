import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isTopSelling = searchParams.get("topSelling") === "true";
  const categoryName = searchParams.get("category");

  try {
    if (categoryName) {
      const formattedName = decodeURIComponent(categoryName).replace(/-/g, " ");

      const category = await prisma.category.findFirst({
        where: {
          name: {
            equals: formattedName,
            mode: "insensitive",
          },
        },
        include: {
          items: {
            where: { isPublished: true },
            include: {
              images: true,
              brand: true,
            },
          },
        },
      });

      if (!category) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        category: {
          name: category.name,
          description: category.description,
        },
        products: category.items,
      });
    }

    // Pour les produits top selling
    if (isTopSelling) {
      const products = await prisma.item.findMany({
        where: {
          isPublished: true,
          topSelling: { gt: 0 },
        },
        include: {
          images: true,
          brand: true,
        },
        orderBy: {
          topSelling: "asc",
        },
        take: 4,
      });

      return NextResponse.json({ products });
    }

    return NextResponse.json({ products: [] });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
