import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { join } from "path";
import { existsSync, unlinkSync } from "fs";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const { name, description, logo } = await request.json();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const brand = await prisma.brand.update({
      where: { id },
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
    console.error("Error updating brand:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Error updating brand",
          message: error.message,
          stack: error.stack,
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Error updating brand", message: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Get the current brand data to check for existing logo
    const existingBrand = await prisma.brand.findUnique({
      where: { id },
      select: { logo: true },
    });

    if (!existingBrand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Remove logo file if it exists
    if (existingBrand.logo) {
      const logoPath = join(process.cwd(), "public", existingBrand.logo);
      if (existsSync(logoPath)) {
        unlinkSync(logoPath);
      }
    }

    // Delete the brand
    await prisma.brand.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting brand:", error);
    return NextResponse.json(
      { error: "Error deleting brand" },
      { status: 500 }
    );
  }
}
