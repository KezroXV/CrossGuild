import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import prisma from "@/shared/lib/prisma";
import {
  generatePasswordResetEmail,
  sendEmail,
} from "@/shared/services/email.service";
import { NotFoundError, ValidationError } from "@/shared/lib/handle-api-error";

const RESET_MESSAGE =
  "If your email is registered, you will receive a password reset link";

export async function requestReset(email: string) {
  console.log("Password reset request received for email:", email);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log(`Password reset requested for non-existent email: ${email}`);
    return { message: RESET_MESSAGE };
  }

  console.log(`Valid password reset request for user: ${user.id}`);

  const token = uuidv4();
  const expires = new Date();
  expires.setHours(expires.getHours() + 24);

  await prisma.passwordResetToken.deleteMany({
    where: { email },
  });

  const resetToken = await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  console.log(`Created password reset token: ${resetToken.id}`);

  const resetUrl = `${process.env.NEXTAUTH_URL}/password-reset/${token}`;
  console.log(`Reset URL: ${resetUrl}`);

  const { html, text } = generatePasswordResetEmail(
    user.name || "User",
    resetUrl
  );

  const allowedTestingEmail =
    process.env.ALLOWED_TEST_EMAIL || "kezro10@gmail.com";

  try {
    const emailResult = await sendEmail({
      to: process.env.NODE_ENV === "production" ? email : allowedTestingEmail,
      subject: "Password Reset Request - CrossGuild",
      text: `${text}\n\nNOTE: In development mode, this email was meant for: ${email}`,
      html: `${html}<div style="margin-top: 20px; padding: 10px; background-color: #f8f9fa; border-left: 4px solid #6c757d;">
          <p><strong>Development Note:</strong> This email was originally intended for ${email}</p>
          <p>In development mode, all emails are redirected to ${allowedTestingEmail}</p>
        </div>`,
    });

    if (!emailResult.success) {
      console.error("Failed to send password reset email:", emailResult.error);
    } else {
      console.log("Password reset email sent successfully");
    }
  } catch (error) {
    console.error("Error sending password reset email:", error);
  }

  return {
    message: RESET_MESSAGE,
    ...(process.env.NODE_ENV !== "production" && { token, resetUrl }),
  };
}

export async function verifyToken(token: string) {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken) {
    return { valid: false as const, error: "Invalid token" };
  }

  if (resetToken.expires < new Date()) {
    return { valid: false as const, error: "Token has expired" };
  }

  return { valid: true as const, email: resetToken.email };
}

export async function resetPassword(token: string, password: string) {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken) {
    throw new ValidationError("Invalid or expired token");
  }

  if (resetToken.expires < new Date()) {
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });
    throw new ValidationError("Token has expired");
  }

  const user = await prisma.user.findUnique({
    where: { email: resetToken.email },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  await prisma.passwordResetToken.delete({
    where: { id: resetToken.id },
  });

  return { message: "Password has been reset successfully" };
}
