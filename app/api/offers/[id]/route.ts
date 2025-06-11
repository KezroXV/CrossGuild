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

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const offerId = params.id;
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

    // Si une nouvelle image a été téléchargée, l'uploader vers Cloudinary
    if (offerImage && offerImage.size > 0) {
      console.log(
        "[OFFERS_UPDATE] Starting offer image upload to Cloudinary..."
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
          "[OFFERS_UPDATE] Buffer created, uploading to Cloudinary..."
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
                console.error("[OFFERS_UPDATE] Cloudinary error:", error);
                reject(error);
              } else {
                console.log(
                  "[OFFERS_UPDATE] Cloudinary success:",
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

        console.log("[OFFERS_UPDATE] Image uploaded successfully:", imagePath);
      } catch (error) {
        console.error("[OFFERS_UPDATE] Error uploading to Cloudinary:", error);
        return NextResponse.json(
          { error: "Failed to upload image" },
          { status: 500 }
        );
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
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const offerId = params.id;

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
