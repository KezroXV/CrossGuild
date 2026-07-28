import bcrypt from "bcryptjs";
import prisma from "@/shared/lib/prisma";
import { ConflictError, NotFoundError } from "@/shared/lib/handle-api-error";
import type { RegisterInput } from "@/features/auth/validations/auth.schema";

export type VerifyEmailError =
  | "invalid-token"
  | "expired-token"
  | "user-not-found";

export type VerifyEmailResult =
  | { status: "success" }
  | { status: VerifyEmailError };

export async function registerUser(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new ConflictError("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashedPassword,
      image: input.image,
      phone: input.phone,
      address: input.address,
      city: input.city,
      postalCode: input.postalCode,
      country: input.country,
      cart: {
        create: {},
      },
    },
    include: {
      cart: true,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function verifyEmail(token: string): Promise<VerifyEmailResult> {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken) {
    return { status: "invalid-token" };
  }

  if (verificationToken.expires < new Date()) {
    return { status: "expired-token" };
  }

  const user = await prisma.user.findUnique({
    where: { email: verificationToken.identifier },
  });

  if (!user) {
    return { status: "user-not-found" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date() },
  });

  await prisma.verificationToken.delete({
    where: { token: verificationToken.token },
  });

  return { status: "success" };
}

export async function refreshSession(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      phone: true,
      isAdmin: true,
      roleId: true,
    },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return user;
}
