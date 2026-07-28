import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { passwordResetRequestSchema } from "@/features/auth/validations/password-reset.schema";
import { requestReset } from "@/features/auth/server/password-reset.server";

export async function POST(req: Request) {
  try {
    const { email } = passwordResetRequestSchema.parse(await req.json());
    const result = await requestReset(email);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      console.error(
        "Invalid data in password reset request:",
        error.format()
      );
      return NextResponse.json(
        { error: "Invalid data", details: error.format() },
        { status: 400 }
      );
    }

    console.error("Error in password reset request:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
