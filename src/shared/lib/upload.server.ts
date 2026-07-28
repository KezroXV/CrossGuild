import { Readable } from "stream";
import { v2 as cloudinary } from "cloudinary";
import { ValidationError } from "@/shared/lib/handle-api-error";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

async function bufferToStream(buffer: Buffer) {
  const readable = new Readable();
  readable._read = () => {};
  readable.push(buffer);
  readable.push(null);
  return readable;
}

export async function uploadImage(file: File): Promise<string> {
  if (!file || file.size === 0) {
    throw new ValidationError("No file uploaded");
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new ValidationError(
      "File type not supported. Please upload a JPG, PNG, GIF, or WebP image."
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new ValidationError("File size exceeds the 5MB limit");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const uploadResult = await new Promise<{ secure_url: string }>(
    (resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "crossguild",
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as { secure_url: string });
        }
      );
      bufferToStream(buffer).then((readable) => readable.pipe(stream));
    }
  );

  return uploadResult.secure_url;
}
