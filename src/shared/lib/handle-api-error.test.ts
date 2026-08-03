import { Prisma } from "@prisma/client";
import { ZodError, z } from "zod";
import {
  AppError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
  handleApiError,
} from "./handle-api-error";

describe("AppError subclasses", () => {
  it("NotFoundError has correct code and status", () => {
    const error = new NotFoundError("User not found");
    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe("NOT_FOUND");
    expect(error.status).toBe(404);
    expect(error.message).toBe("User not found");
  });

  it("UnauthorizedError has correct code and status", () => {
    const error = new UnauthorizedError();
    expect(error.code).toBe("UNAUTHORIZED");
    expect(error.status).toBe(401);
  });

  it("ForbiddenError has correct code and status", () => {
    const error = new ForbiddenError();
    expect(error.code).toBe("FORBIDDEN");
    expect(error.status).toBe(403);
  });

  it("ValidationError has correct code and status", () => {
    const error = new ValidationError("Invalid input");
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.status).toBe(400);
    expect(error.message).toBe("Invalid input");
  });

  it("ConflictError has correct code and status", () => {
    const error = new ConflictError();
    expect(error.code).toBe("CONFLICT");
    expect(error.status).toBe(409);
  });
});

describe("handleApiError", () => {
  it("maps AppError to apiError response", async () => {
    const response = handleApiError(new NotFoundError("Missing"));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({
      success: false,
      error: { code: "NOT_FOUND", message: "Missing" },
    });
  });

  it("maps ZodError to validation apiError response", async () => {
    const schema = z.object({ email: z.string().email("Invalid email format") });
    let zodError: ZodError | undefined;

    schema.safeParse({ email: "not-an-email" });
    try {
      schema.parse({ email: "not-an-email" });
    } catch (error) {
      zodError = error as ZodError;
    }

    const response = handleApiError(zodError!);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.message).toContain("Invalid email format");
  });

  it("maps Prisma P2002 to conflict response", async () => {
    const error = new Prisma.PrismaClientKnownRequestError("Unique constraint", {
      code: "P2002",
      clientVersion: "6.8.2",
    });

    const response = handleApiError(error);
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body).toEqual({
      success: false,
      error: { code: "CONFLICT", message: "Resource already exists" },
    });
  });

  it("maps Prisma P2025 to not found response", async () => {
    const error = new Prisma.PrismaClientKnownRequestError("Record not found", {
      code: "P2025",
      clientVersion: "6.8.2",
    });

    const response = handleApiError(error);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({
      success: false,
      error: { code: "NOT_FOUND", message: "Resource not found" },
    });
  });

  it("maps unknown errors to internal server error", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const response = handleApiError(new Error("Unexpected"));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Internal server error" },
    });
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
