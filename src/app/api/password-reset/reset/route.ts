import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { passwordResetSchema } from "@/features/auth/validations/password-reset.schema";
import { resetPassword } from "@/features/auth/server/password-reset.server";
import {
  NotFoundError,
  ValidationError,
  handleApiError,
} from "@/shared/lib/handle-api-error";

export async function POST(req: Request) {
  try {
    const { token, password } = passwordResetSchema.parse(await req.json());
    const result = await resetPassword(token, password);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Invalid data" },
        { status: 400 }
      );
    }

    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error("Error resetting password:", error);
    return handleApiError(error);
  }
}
