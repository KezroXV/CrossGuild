import { passwordChangeSchema, personalInfoSchema } from "./profile.schema";

describe("personalInfoSchema", () => {
  it("accepts valid personal info", () => {
    const result = personalInfoSchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "0612345678",
      city: "Paris",
    });

    expect(result.success).toBe(true);
  });

  it("rejects name shorter than 2 characters", () => {
    const result = personalInfoSchema.safeParse({
      name: "J",
      email: "jane@example.com",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Name must be at least 2 characters"
      );
    }
  });

  it("rejects invalid email", () => {
    const result = personalInfoSchema.safeParse({
      name: "Jane Doe",
      email: "invalid",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Invalid email");
    }
  });
});

describe("passwordChangeSchema", () => {
  it("accepts matching new and confirm passwords", () => {
    const result = passwordChangeSchema.safeParse({
      currentPassword: "oldpass",
      newPassword: "newpass",
      confirmPassword: "newpass",
    });

    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = passwordChangeSchema.safeParse({
      currentPassword: "oldpass",
      newPassword: "newpass",
      confirmPassword: "different",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Passwords do not match");
      expect(result.error.issues[0].path).toEqual(["confirmPassword"]);
    }
  });

  it("rejects passwords shorter than 6 characters", () => {
    const result = passwordChangeSchema.safeParse({
      currentPassword: "12345",
      newPassword: "12345",
      confirmPassword: "12345",
    });

    expect(result.success).toBe(false);
  });
});
