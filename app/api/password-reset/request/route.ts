import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { sendEmail, generatePasswordResetEmail } from "@/lib/email";

// Schema validation
const requestSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Password reset request received for email:", body.email);

    // Validate request
    const result = requestSchema.safeParse(body);
    if (!result.success) {
      console.error(
        "Invalid data in password reset request:",
        result.error.format()
      );
      return NextResponse.json(
        { error: "Invalid data", details: result.error.format() },
        { status: 400 }
      );
    }

    const { email } = body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`Password reset requested for non-existent email: ${email}`);
      // Don't reveal that email doesn't exist for security reasons
      return NextResponse.json(
        {
          message:
            "If your email is registered, you will receive a password reset link",
        },
        { status: 200 }
      );
    }

    console.log(`Valid password reset request for user: ${user.id}`);

    // Generate unique token
    const token = uuidv4();

    // Set token expiration (24 hours)
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);

    // Delete any existing tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    });

    // Create new token in database
    const resetToken = await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    console.log(`Created password reset token: ${resetToken.id}`);

    // Construct reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL}/password-reset/${token}`;
    console.log(`Reset URL: ${resetUrl}`);

    // Generate email content
    const { html, text } = generatePasswordResetEmail(
      user.name || "User",
      resetUrl
    );

    // IMPORTANT: In development/testing with Resend's free tier
    // You can only send emails to your own verified email
    const allowedTestingEmail =
      process.env.ALLOWED_TEST_EMAIL || "kezro10@gmail.com";

    try {
      // Try to send email with reset link
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
        console.error(
          "Failed to send password reset email:",
          emailResult.error
        );
        // Even if email sending fails, we can still return success because the token is created
      } else {
        console.log("Password reset email sent successfully");
      }
    } catch (error) {
      console.error("Error sending password reset email:", error);
      // Continue with success response even if email fails
    }

    // Always return success to prevent enumeration attacks
    return NextResponse.json(
      {
        message:
          "If your email is registered, you will receive a password reset link",
        // In development, include the token for testing purposes
        ...(process.env.NODE_ENV !== "production" && { token, resetUrl }),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in password reset request:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
