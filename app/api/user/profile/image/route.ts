import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function bufferToStream(buffer: Buffer) {
  const readable = new Readable();
  readable._read = () => {};
  readable.push(buffer);
  readable.push(null);
  return readable;
}

export async function POST(req: Request) {
  try {
    console.log("[PROFILE_IMAGE_UPLOAD] Starting profile image upload...");
    
    const session = await auth();

    if (!session?.user) {
      console.log("[PROFILE_IMAGE_UPLOAD] Unauthorized - no session");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    console.log("[PROFILE_IMAGE_UPLOAD] User ID:", userId);

    // Check that the request is FormData with a file
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      console.log("[PROFILE_IMAGE_UPLOAD] No file uploaded");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    console.log("[PROFILE_IMAGE_UPLOAD] File details:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    // Check file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      console.log("[PROFILE_IMAGE_UPLOAD] Invalid file type:", file.type);
      return NextResponse.json(
        { error: "Invalid file type. Only images are allowed." },
        { status: 400 }
      );
    }

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      console.log("[PROFILE_IMAGE_UPLOAD] File too large:", file.size);
      return NextResponse.json(
        { error: "File size exceeds the 5MB limit" },
        { status: 400 }
      );
    }

    console.log("[PROFILE_IMAGE_UPLOAD] Uploading to Cloudinary...");
    
    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log("[PROFILE_IMAGE_UPLOAD] Buffer created, size:", buffer.length);

    // Upload directly to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { 
          folder: "crossguild/profiles",
          resource_type: "image"
        },
        (error, result) => {
          if (error) {
            console.error("[PROFILE_IMAGE_UPLOAD] Cloudinary error:", error);
            reject(error);
          } else {
            console.log("[PROFILE_IMAGE_UPLOAD] Cloudinary success:", result?.secure_url);
            resolve(result);
          }
        }
      );
      bufferToStream(buffer).then((readable) => readable.pipe(stream));
    });

    // @ts-expect-error Cloudinary upload result type is not properly typed
    const imageUrl = uploadResult.secure_url;

    if (!imageUrl) {
      console.log("[PROFILE_IMAGE_UPLOAD] No URL returned from Cloudinary");
      throw new Error("Upload successful but no URL returned");
    }

    console.log("[PROFILE_IMAGE_UPLOAD] Image uploaded successfully:", imageUrl);
    
    // Update user image URL in database
    console.log("[PROFILE_IMAGE_UPLOAD] Updating database...");
    await prisma.user.update({
      where: { id: userId },
      data: { image: imageUrl },
    });

    console.log("[PROFILE_IMAGE_UPLOAD] Database updated successfully");

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
    });
  } catch (error) {
    console.error("[PROFILE_IMAGE_UPLOAD] Error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
