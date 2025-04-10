import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";
import fs from "fs/promises";

export async function GET() {
  try {
    // Vérifier si le modèle existe
    let modelExists = true;
    try {
      await prisma.offer.findFirst();
    } catch (e) {
      console.log("Le modèle Offer n'existe probablement pas encore:", e);
      modelExists = false;
    }

    if (!modelExists) {
      return NextResponse.json(
        [
          {
            id: "default1",
            title: "Holiday Special",
            description: "Get 30% Off",
            buttonLabel: "Free Delivery",
            image: "/offers/offer1.png",
          },
          {
            id: "default2",
            title: "New Arrivals",
            description: "Limited Edition Gear",
            buttonLabel: "Free Delivery",
            image: "/offers/offer2.png",
          },
        ],
        { status: 200 }
      );
    }

    // Récupérer toutes les offres
    const offers = await prisma.offer.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    // Si aucune offre n'existe, retourner des données par défaut sans les créer
    if (offers.length === 0) {
      return NextResponse.json(
        [
          {
            id: "default1",
            title: "Holiday Special",
            description: "Get 30% Off",
            buttonLabel: "Free Delivery",
            image: "/offers/offer1.png",
          },
          {
            id: "default2",
            title: "New Arrivals",
            description: "Limited Edition Gear",
            buttonLabel: "Free Delivery",
            image: "/offers/offer2.png",
          },
        ],
        { status: 200 }
      );
    }

    return NextResponse.json(offers);
  } catch (error) {
    console.error("Error fetching offers:", error);
    return NextResponse.json(
      { error: "Failed to fetch offers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const buttonLabel =
      (formData.get("buttonLabel") as string) || "Free Delivery";
    const offerImage = formData.get("image") as File;

    let imagePath = "/offers/default.png";

    // Si une image a été téléchargée, la traiter
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

    // Créer une nouvelle offre
    const newOffer = await prisma.offer.create({
      data: {
        title,
        description,
        buttonLabel,
        image: imagePath,
      },
    });

    return NextResponse.json(newOffer);
  } catch (error) {
    console.error("Error creating offer:", error);
    return NextResponse.json(
      { error: "Failed to create offer" },
      { status: 500 }
    );
  }
}
