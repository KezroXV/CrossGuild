import { z } from "zod";

export const passwordResetRequestSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export const passwordResetVerifySchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export const passwordResetSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(
      /[0-9!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one number or special character"
    ),
});

export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetVerifyInput = z.infer<typeof passwordResetVerifySchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
