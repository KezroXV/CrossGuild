import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    // Vérifier que la requête est une FormData avec un fichier
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Vérifier le type de fichier
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only images are allowed." },
        { status: 400 }
      );
    }

    // Créer un nom de fichier unique
    const uniqueFilename = `${uuidv4()}${path.extname(file.name || ".jpg")}`;

    // Chemin de sauvegarde relatif au dossier public
    const uploadDir = path.join(process.cwd(), "public", "uploads", "profiles");

    // S'assurer que le dossier existe
    try {
      await mkdir(uploadDir, { recursive: true });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      console.log("Directory already exists or cannot be created");
    }

    const filePath = path.join(uploadDir, uniqueFilename);

    // Convertir le fichier en buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Écrire le fichier
    await writeFile(filePath, buffer);

    // URL relative pour accéder à l'image depuis le frontend
    const imageUrl = `/uploads/profiles/${uniqueFilename}`;

    // Mettre à jour l'URL de l'image de l'utilisateur dans la base de données
    await prisma.user.update({
      where: { id: userId },
      data: { image: imageUrl },
    });

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
    });
  } catch (error) {
    console.error("[PROFILE_IMAGE_UPLOAD]", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
