import {
  passwordResetRequestSchema,
  passwordResetSchema,
  passwordResetVerifySchema,
} from "./password-reset.schema";

describe("passwordResetRequestSchema", () => {
  it("accepts valid email", () => {
    const result = passwordResetRequestSchema.safeParse({
      email: "user@example.com",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = passwordResetRequestSchema.safeParse({
      email: "not-an-email",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Invalid email format");
    }
  });
});

describe("passwordResetVerifySchema", () => {
  it("accepts non-empty token", () => {
    const result = passwordResetVerifySchema.safeParse({ token: "abc123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty token", () => {
    const result = passwordResetVerifySchema.safeParse({ token: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Token is required");
    }
  });
});

describe("passwordResetSchema", () => {
  it("accepts strong password with token", () => {
    const result = passwordResetSchema.safeParse({
      token: "reset-token",
      password: "Secure1!",
    });

    expect(result.success).toBe(true);
  });

  it("rejects password shorter than 8 characters", () => {
    const result = passwordResetSchema.safeParse({
      token: "reset-token",
      password: "Ab1!",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Password must be at least 8 characters"
      );
    }
  });

  it("rejects password without uppercase letter", () => {
    const result = passwordResetSchema.safeParse({
      token: "reset-token",
      password: "secure1!",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) =>
        issue.message.includes("uppercase")
      )).toBe(true);
    }
  });

  it("rejects password without lowercase letter", () => {
    const result = passwordResetSchema.safeParse({
      token: "reset-token",
      password: "SECURE1!",
    });

    expect(result.success).toBe(false);
  });

  it("rejects password without number or special character", () => {
    const result = passwordResetSchema.safeParse({
      token: "reset-token",
      password: "SecurePass",
    });

    expect(result.success).toBe(false);
  });
});
