import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { E2E_USER } from "./helpers/auth";

export default async function globalSetup() {
  if (!process.env.DATABASE_URL) {
    console.warn("Skipping E2E user setup: DATABASE_URL is not configured.");
    return;
  }

  const prisma = new PrismaClient();

  try {
    const hashedPassword = await bcrypt.hash(E2E_USER.password, 10);

    await prisma.user.upsert({
      where: { email: E2E_USER.email },
      update: {
        name: E2E_USER.name,
        password: hashedPassword,
        isAdmin: false,
      },
      create: {
        name: E2E_USER.name,
        email: E2E_USER.email,
        password: hashedPassword,
        isAdmin: false,
        cart: {
          create: {},
        },
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}
