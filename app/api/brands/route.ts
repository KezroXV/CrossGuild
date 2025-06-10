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
    const formData = await request.formData();
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
      
      const uploadResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/upload`, {
        method: "POST",
        body: logoFormData,
      });
      
      if (uploadResponse.ok) {
        const uploadResult = await uploadResponse.json();
        logoUrl = uploadResult.url;
      }
    } else if (logo && typeof logo === "string") {
      // Si logo est déjà une URL
      logoUrl = logo;
    }

    // Vérification de l'URL si elle existe
    if (logoUrl && (typeof logoUrl !== "string" || (!logoUrl.startsWith("http") && !logoUrl.startsWith("/uploads/") && !logoUrl.includes("cloudinary.com")))) {
      return NextResponse.json(
        { error: "Logo must be a valid URL (http(s)://, /uploads/... ou cloudinary.com)" },
        { status: 400 }
      );
    }

    const brand = await prisma.brand.create({
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
