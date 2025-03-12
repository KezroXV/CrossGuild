import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile } from "fs/promises";
import { join } from "path";

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
    const logo = formData.get("logo") as File;

    // Gérer le fichier uploadé
    if (logo) {
      const bytes = await logo.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Créer un nom de fichier unique
      const filename = `${Date.now()}-${logo.name}`;
      const path = join(process.cwd(), "public/uploads", filename);

      // Sauvegarder le fichier
      await writeFile(path, buffer);

      // Créer la marque avec le chemin du fichier
      const brand = await prisma.brand.create({
        data: {
          name,
          description,
          logo: `/uploads/${filename}`,
        },
        select: {
          id: true,
          name: true,
          logo: true,
          description: true,
        },
      });

      return NextResponse.json(brand);
    }

    // Si pas de logo, créer la marque sans logo
    const brand = await prisma.brand.create({
      data: {
        name,
        description,
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
    return NextResponse.json(
      { error: "Error creating brand" },
      { status: 500 }
    );
  }
}
