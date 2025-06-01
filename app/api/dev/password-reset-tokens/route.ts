import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// This endpoint should only be available in development
export async function GET() {
  // Prevent access in production
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "This endpoint is only available in development mode" },
      { status: 403 }
    );
  }

  try {
    // Get all active password reset tokens
    const tokens = await prisma.passwordResetToken.findMany({
      where: {
        expires: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // For each token, create a reset URL
    const tokenData = tokens.map((token) => ({
      id: token.id,
      email: token.email,
      expires: token.expires,
      createdAt: token.createdAt,
      token: token.token,
      resetUrl: `${process.env.NEXTAUTH_URL}/password-reset/${token.token}`,
    }));

    return NextResponse.json({
      tokens: tokenData,
      note: "This endpoint is only available in development mode for testing purposes.",
    });
  } catch (error) {
    console.error("Error retrieving password reset tokens:", error);
    return NextResponse.json(
      { error: "An error occurred while retrieving password reset tokens" },
      { status: 500 }
    );
  }
}
