import bcrypt from "bcryptjs";
import prisma from "@/shared/lib/prisma";
import { uploadImage } from "@/shared/lib/upload.server";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@/shared/lib/handle-api-error";

const profileSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  image: true,
} as const;

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: profileSelect,
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return user;
}

export async function updateProfile(
  userId: string,
  data: { name?: string; email?: string; phone?: string; city?: string },
  currentEmail: string
) {
  const { name, email, phone, city } = data;

  if (!name || !email) {
    throw new ValidationError("Name and email are required");
  }

  if (email !== currentEmail) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new ConflictError("Email is already taken");
    }
  }

  return prisma.user.update({
    where: { id: userId },
    data: { name, email, phone, city },
    select: profileSelect,
  });
}

export async function updatePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  if (!currentPassword || !newPassword) {
    throw new ValidationError("Current password and new password are required");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      password: true,
    },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const isPasswordValid = await bcrypt.compare(
    currentPassword,
    user.password as string
  );

  if (!isPasswordValid) {
    throw new ValidationError("Current password is incorrect");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { success: true };
}

export async function uploadProfileImage(userId: string, file: File | null) {
  if (!file) {
    throw new ValidationError("No file uploaded");
  }

  const imageUrl = await uploadImage(file);

  await prisma.user.update({
    where: { id: userId },
    data: { image: imageUrl },
  });

  return { success: true, imageUrl };
}
