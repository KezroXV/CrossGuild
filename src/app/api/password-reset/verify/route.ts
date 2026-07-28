import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { passwordResetVerifySchema } from "@/features/auth/validations/password-reset.schema";
import { verifyToken } from "@/features/auth/server/password-reset.server";

export async function POST(req: Request) {
  try {
    const { token } = passwordResetVerifySchema.parse(await req.json());
    const result = await verifyToken(token);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.format() },
        { status: 400 }
      );
    }

    console.error("Error verifying token:", error);
    return NextResponse.json(
      { valid: false, error: "An error occurred while verifying the token" },
      { status: 500 }
    );
  }
}
