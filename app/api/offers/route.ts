import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to convert buffer to stream for Cloudinary
const bufferToStream = async (buffer: Buffer): Promise<Readable> => {
  return new Promise((resolve) => {
    const readable = new Readable({
      read() {
        this.push(buffer);
        this.push(null);
      },
    });
    resolve(readable);
  });
};

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

    // Si une image a été téléchargée, l'uploader vers Cloudinary
    if (offerImage && offerImage.size > 0) {
      console.log(
        "[OFFERS_UPLOAD] Starting offer image upload to Cloudinary..."
      );

      // Validation du type de fichier
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(offerImage.type)) {
        return NextResponse.json(
          { error: "Invalid file type. Only images are allowed." },
          { status: 400 }
        );
      }

      // Validation de la taille (5MB max)
      if (offerImage.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File size exceeds the 5MB limit" },
          { status: 400 }
        );
      }

      try {
        const buffer = Buffer.from(await offerImage.arrayBuffer());
        console.log(
          "[OFFERS_UPLOAD] Buffer created, uploading to Cloudinary..."
        );

        // Upload vers Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "crossguild/offers",
              resource_type: "image",
            },
            (error, result) => {
              if (error) {
                console.error("[OFFERS_UPLOAD] Cloudinary error:", error);
                reject(error);
              } else {
                console.log(
                  "[OFFERS_UPLOAD] Cloudinary success:",
                  result?.secure_url
                );
                resolve(result);
              }
            }
          );
          bufferToStream(buffer).then((readable) => readable.pipe(stream));
        });

        // @ts-expect-error Cloudinary upload result type is not properly typed
        imagePath = uploadResult.secure_url;

        if (!imagePath) {
          throw new Error("Upload successful but no URL returned");
        }

        console.log("[OFFERS_UPLOAD] Image uploaded successfully:", imagePath);
      } catch (error) {
        console.error("[OFFERS_UPLOAD] Error uploading to Cloudinary:", error);
        return NextResponse.json(
          { error: "Failed to upload image" },
          { status: 500 }
        );
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
