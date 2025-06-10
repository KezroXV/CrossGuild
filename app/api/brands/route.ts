import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      select: {
        id: true,
        name: true,
        logo: true,
        description: true,
        items: {
          select: {
            id: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    const brandsWithItemCount = brands.map((brand) => ({
      ...brand,
      itemCount: brand.items.length,
      items: undefined,
    }));

    return NextResponse.json(brandsWithItemCount);
  } catch (error) {
    console.error("Error retrieving brands:", error);
    return NextResponse.json(
      { error: "Error retrieving brands" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, logo } = await request.json();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }    if (
      logo &&
      (typeof logo !== "string" ||
        (!logo.startsWith("http") && !logo.startsWith("/uploads/") && !logo.includes("cloudinary.com")))
    ) {
      return NextResponse.json(
        { error: "Logo must be a valid URL (http(s)://, /uploads/... ou cloudinary.com)" },
        { status: 400 }
      );
    }
    const brand = await prisma.brand.create({
      data: {
        name,
        description,
        logo, // logo est une URL ou undefined
      },
      select: {
        id: true,
        name: true,
        logo: true,
        description: true,
      },
    });
    return NextResponse.json(brand);
  } catch (error) {
    console.error("Error creating brand:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Error creating brand",
          message: error.message,
          stack: error.stack,
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Error creating brand", message: String(error) },
      { status: 500 }
    );
  }
}
