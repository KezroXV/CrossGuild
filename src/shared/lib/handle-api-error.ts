import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { apiError } from "./api-response";

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 500
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super("NOT_FOUND", message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super("UNAUTHORIZED", message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super("FORBIDDEN", message, 403);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed") {
    super("VALIDATION_ERROR", message, 400);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super("CONFLICT", message, 409);
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return apiError(error.code, error.message, error.status);
  }

  if (error instanceof ZodError) {
    const message = error.errors.map((issue) => issue.message).join(", ");
    return apiError("VALIDATION_ERROR", message, 400);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return apiError("CONFLICT", "Resource already exists", 409);
    }

    if (error.code === "P2025") {
      return apiError("NOT_FOUND", "Resource not found", 404);
    }
  }

  console.error("Unhandled API error:", error);
  return apiError("INTERNAL_ERROR", "Internal server error", 500);
}
