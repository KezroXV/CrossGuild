import { NextRequest, NextResponse } from "next/server";
import { verifyEmail } from "@/features/auth/server/auth.server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const baseUrl = process.env.NEXTAUTH_URL!;
  const { token } = await params;

  try {
    const result = await verifyEmail(token);

    if (result.status === "success") {
      return NextResponse.redirect(`${baseUrl}/verify-success`);
    }

    return NextResponse.redirect(
      `${baseUrl}/verify-error?error=${result.status}`
    );
  } catch (error) {
    console.error("Error confirming email:", error);
    return NextResponse.redirect(`${baseUrl}/verify-error?error=server-error`);
  }
}
