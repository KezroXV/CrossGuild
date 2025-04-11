import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";
import fs from "fs/promises";

export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const offerId = context.params.id;
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const buttonLabel =
      (formData.get("buttonLabel") as string) || "Free Delivery";
    const offerImage = formData.get("image") as File;

    // Récupérer l'offre existante
    const existingOffer = await prisma.offer.findUnique({
      where: { id: offerId },
    });

    if (!existingOffer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    let imagePath = existingOffer.image;

    // Si une nouvelle image a été téléchargée, la traiter
    if (offerImage && offerImage.size > 0) {
      const bytes = await offerImage.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // S'assurer que le dossier existe
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      try {
        await fs.access(uploadsDir);
      } catch {
        await fs.mkdir(uploadsDir, { recursive: true });
      }

      // Générer un nom de fichier unique
      const filename = `offer-${Date.now()}-${offerImage.name.replace(
        /\s+/g,
        "-"
      )}`;
      const uploadPath = path.join(uploadsDir, filename);

      try {
        await fs.writeFile(uploadPath, buffer);
        imagePath = `/uploads/${filename}`;
      } catch (error) {
        console.error("Error saving image:", error);
      }
    }

    // Mettre à jour l'offre
    const updatedOffer = await prisma.offer.update({
      where: { id: offerId },
      data: {
        title,
        description,
        buttonLabel,
        image: imagePath,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedOffer);
  } catch (error) {
    console.error("Error updating offer:", error);
    return NextResponse.json(
      { error: "Failed to update offer" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const offerId = context.params.id;

    // Vérifier si l'offre existe
    const existingOffer = await prisma.offer.findUnique({
      where: { id: offerId },
    });

    if (!existingOffer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    // Supprimer l'offre
    await prisma.offer.delete({
      where: { id: offerId },
    });

    return NextResponse.json({ message: "Offer deleted successfully" });
  } catch (error) {
    console.error("Error deleting offer:", error);
    return NextResponse.json(
      { error: "Failed to delete offer" },
      { status: 500 }
    );
  }
}
