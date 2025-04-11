import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Schema validation
const verifySchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request
    const result = verifySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid data", details: result.error.format() },
        { status: 400 }
      );
    }

    const { token } = body;

    // Find token in database
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    // Check if token exists
    if (!resetToken) {
      return NextResponse.json(
        { valid: false, error: "Invalid token" },
        { status: 200 }
      );
    }

    // Check if token is expired
    if (resetToken.expires < new Date()) {
      return NextResponse.json(
        { valid: false, error: "Token has expired" },
        { status: 200 }
      );
    }

    // Token is valid
    return NextResponse.json(
      { valid: true, email: resetToken.email },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.json(
      { valid: false, error: "An error occurred while verifying the token" },
      { status: 500 }
    );
  }
}
