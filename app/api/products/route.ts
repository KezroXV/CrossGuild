import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get("sort");

  try {
    const products = await prisma.item.findMany({
      where: {
        isPublished: true,
        topSelling: {
          gt: 0,
        },
      },
      orderBy: sort === "topSelling" ? { topSelling: "desc" } : undefined,
      include: {
        images: true,
      },
    });

    return NextResponse.json(
      products.map((product) => ({
        ...product,
        slug: product.slug, // Assurez-vous que le slug est inclus
      }))
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Error fetching products" },
      { status: 500 }
    );
  }
}
