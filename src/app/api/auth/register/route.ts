import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { registerSchema } from "@/features/auth/validations/auth.schema";
import { registerUser } from "@/features/auth/server/auth.server";
import {
  ConflictError,
  handleApiError,
} from "@/shared/lib/handle-api-error";

export async function POST(req: Request) {
  try {
    const body = registerSchema.parse(await req.json());
    const user = await registerUser(body);

    return NextResponse.json(
      { message: "User created successfully", user },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.format() },
        { status: 400 }
      );
    }

    if (error instanceof ConflictError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return handleApiError(error);
  }
}
