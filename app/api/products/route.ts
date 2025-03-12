import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
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

    const isTopSelling = searchParams.get("topSelling") === "true";
    if (isTopSelling) {
      const products = await prisma.item.findMany({
        where: {
          isPublished: true,
          topSelling: { gt: 0 },
        },
        include: {
          images: true,
          brand: true,
          reviews: true,
        },
        orderBy: {
          topSelling: "asc",
        },
        take: 4,
      });

      const productsWithRating = products.map((product) => ({
        ...product,
        rating:
          product.reviews.reduce((acc, review) => acc + review.rating, 0) /
            product.reviews.length || 0,
      }));

      return NextResponse.json({ products: productsWithRating });
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
