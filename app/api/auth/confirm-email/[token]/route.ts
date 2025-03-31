import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { token: string } }
) {
  const token = params.token;

  try {
    // Find verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/verify-error?error=invalid-token`
      );
    }

    // Check if token is expired
    if (verificationToken.expires < new Date()) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/verify-error?error=expired-token`
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    });

    if (!user) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/verify-error?error=user-not-found`
      );
    }

    // Update user, set emailVerified
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });

    // Delete the used token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });

    // Redirect to success page
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/verify-success`);
  } catch (error) {
    console.error("Error confirming email:", error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/verify-error?error=server-error`
    );
  }
}
