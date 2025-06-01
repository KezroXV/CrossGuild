/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { writeFile } from "fs/promises";
import { join } from "path";
import { existsSync, unlinkSync } from "fs";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData();
    const id = params.id;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string | null;
    const logo = formData.get("logo") as File | null;

    // Get the current brand data to check for existing logo
    const existingBrand = await prisma.brand.findUnique({
      where: { id },
      select: { logo: true },
    });

    if (!existingBrand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    const updateData: any = {
      name,
      description: description || undefined,
    };

    // Handle logo upload if provided
    if (logo && logo.size > 0) {
      const bytes = await logo.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create unique filename
      const filename = `${Date.now()}-${logo.name}`;
      const path = join(process.cwd(), "public/uploads", filename);

      // Save the file
      await writeFile(path, buffer);
      updateData.logo = `/uploads/${filename}`;

      // Remove old logo file if it exists
      if (existingBrand.logo) {
        const oldPath = join(process.cwd(), "public", existingBrand.logo);
        if (existsSync(oldPath)) {
          unlinkSync(oldPath);
        }
      }
    }

    // Update the brand
    const brand = await prisma.brand.update({
      where: { id },
      data: updateData,
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
    return NextResponse.json(
      { error: "Error updating brand" },
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
