import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const categoryId = url.searchParams.get("categoryId");
    const excludeId = url.searchParams.get("excludeId");
    const limit = parseInt(url.searchParams.get("limit") || "4", 10);

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    console.log(
      `Fetching related products: categoryId=${categoryId}, excludeId=${excludeId}, limit=${limit}`
    );

    // Find related products by same category
    let relatedProducts = await prisma.item.findMany({
      where: {
        categoryId: categoryId,
        isPublished: true,
        ...(excludeId && { id: { not: excludeId } }),
      },
      include: {
        images: true,
        brand: true,
        category: true,
      },
      take: limit,
    });

    console.log(
      `Found ${relatedProducts.length} products in the same category`
    );

    // If we don't have enough products, add some from other categories
    if (relatedProducts.length < limit) {
      const moreProducts = await prisma.item.findMany({
        where: {
          isPublished: true,
          ...(excludeId && { id: { not: excludeId } }),
          id: { notIn: relatedProducts.map((p) => p.id) },
        },
        include: {
          images: true,
          brand: true,
          category: true,
        },
        take: limit - relatedProducts.length,
      });

      console.log(
        `Found ${moreProducts.length} additional products from other categories`
      );
      relatedProducts = [...relatedProducts, ...moreProducts];
    }

    console.log(
      `Returning total of ${relatedProducts.length} related products`
    );
    return NextResponse.json({ products: relatedProducts });
  } catch (error) {
    console.error("Error fetching related products:", error);
    return NextResponse.json(
      { error: "Failed to fetch related products" },
      { status: 500 }
    );
  }
}
