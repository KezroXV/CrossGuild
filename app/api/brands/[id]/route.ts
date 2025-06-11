import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
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
    const description = formData.get("description") as string;
    const logo = formData.get("logo") as File | string;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    let logoUrl: string | undefined;

    // Si logo est un File, on l'upload vers Cloudinary
    if (logo && logo instanceof File && logo.size > 0) {
      const logoFormData = new FormData();
      logoFormData.append("file", logo);

      const uploadResponse = await fetch(
        `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/upload`,
        {
          method: "POST",
          body: logoFormData,
        }
      );

      if (uploadResponse.ok) {
        const uploadResult = await uploadResponse.json();
        logoUrl = uploadResult.url;
      }
    } else if (logo && typeof logo === "string") {
      // Si logo est déjà une URL, on la garde
      logoUrl = logo;
    }

    // Vérification de l'URL si elle existe
    if (
      logoUrl &&
      (typeof logoUrl !== "string" ||
        (!logoUrl.startsWith("http") &&
          !logoUrl.startsWith("/uploads/") &&
          !logoUrl.includes("cloudinary.com")))
    ) {
      return NextResponse.json(
        {
          error:
            "Logo must be a valid URL (http(s)://, /uploads/... ou cloudinary.com)",
        },
        { status: 400 }
      );
    }

    const brand = await prisma.brand.update({
      where: { id },
      data: {
        name,
        description: description || undefined,
        logo: logoUrl,
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
