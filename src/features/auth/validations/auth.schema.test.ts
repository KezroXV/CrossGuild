import { loginSchema, registerSchema } from "./auth.schema";

describe("registerSchema", () => {
  it("accepts valid registration input", () => {
    const result = registerSchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "secret1",
    });

    expect(result.success).toBe(true);
  });

  it("rejects name shorter than 2 characters", () => {
    const result = registerSchema.safeParse({
      name: "J",
      email: "jane@example.com",
      password: "secret1",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Name must contain at least 2 characters"
      );
    }
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      name: "Jane Doe",
      email: "not-an-email",
      password: "secret1",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Invalid email format");
    }
  });

  it("rejects password shorter than 6 characters", () => {
    const result = registerSchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "12345",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Password must contain at least 6 characters"
      );
    }
  });
});

describe("loginSchema", () => {
  it("accepts valid login input", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "any-password",
    });

    expect(result.success).toBe(true);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Password is required");
    }
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "bad-email",
      password: "secret",
    });

    expect(result.success).toBe(false);
  });
});
