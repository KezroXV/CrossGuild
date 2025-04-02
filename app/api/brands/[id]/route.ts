import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unlink, writeFile } from "fs/promises";
import { join } from "path";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Récupérer la marque et son logo avant la suppression
    const brand = await prisma.brand.findUnique({
      where: { id: params.id },
      select: {
        logo: true,
      },
    });

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Supprimer le fichier logo si il existe
    if (brand.logo) {
      try {
        const logoPath = join(process.cwd(), "public", brand.logo);
        await unlink(logoPath);
      } catch (error) {
        console.error("Error deleting logo file:", error);
      }
    }

    // Supprimer la marque
    await prisma.brand.delete({
      where: { id: params.id },
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

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const logo = formData.get("logo") as File | null;

    // Récupérer l'ancienne marque
    const oldBrand = await prisma.brand.findUnique({
      where: { id: params.id },
      select: { logo: true },
    });

    let logoPath = oldBrand?.logo;

    // Gérer le nouveau logo si fourni
    if (logo && logo instanceof File) {
      // Supprimer l'ancien logo
      if (oldBrand?.logo) {
        try {
          await unlink(join(process.cwd(), "public", oldBrand.logo));
        } catch (error) {
          console.error("Error deleting old logo:", error);
        }
      }

      // Sauvegarder le nouveau logo
      const bytes = await logo.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${logo.name}`;
      const path = join(process.cwd(), "public/uploads", filename);
      await writeFile(path, buffer);
      logoPath = `/uploads/${filename}`;
    }

    // Mettre à jour la marque
    const updatedBrand = await prisma.brand.update({
      where: { id: params.id },
      data: {
        name,
        description,
        ...(logoPath && { logo: logoPath }),
      },
      select: {
        id: true,
        name: true,
        description: true,
        logo: true,
      },
    });

    return NextResponse.json(updatedBrand);
  } catch (error) {
    console.error("Error updating brand:", error);
    return NextResponse.json(
      { error: "Error updating brand" },
      { status: 500 }
    );
  }
}
