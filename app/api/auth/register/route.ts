import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Validation schema
const userSchema = z.object({
  name: z
    .string()
    .min(2, "Name must contain at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must contain at least 6 characters"),
  image: z.string().optional().nullable(),
  phone: z.string().optional().nullable(), // Changed from phoneNumber to phone
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Data validation
    const result = userSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid data", details: result.error.format() },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      password,
      image,
      phone, // Changed from phoneNumber to phone
      address,
      city,
      postalCode,
      country,
    } = body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Password hashing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with cart and additional fields
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        image,
        phone, // Changed from phoneNumber to phone
        address,
        city,
        postalCode,
        country,
        cart: {
          create: {}, // Create empty cart for user
        },
      },
      include: {
        cart: true,
      },
    });

    // Don't return password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { message: "User created successfully", user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json({ error: "Error creating user" }, { status: 500 });
  }
}
