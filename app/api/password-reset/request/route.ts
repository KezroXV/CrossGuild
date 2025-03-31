import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import nodemailer from "nodemailer";

// Schema validation
const requestSchema = z.object({
  email: z.string().email("Invalid email format"),
});

// Configure email transporter - replace with your SMTP settings in production
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST || "smtp.example.com",
  port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
  secure: process.env.EMAIL_SERVER_SECURE === "true",
  auth: {
    user: process.env.EMAIL_SERVER_USER || "user@example.com",
    pass: process.env.EMAIL_SERVER_PASSWORD || "password",
  },
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request
    const result = requestSchema.safeParse(body);
    if (!result.success) {
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
      // Don't reveal that email doesn't exist for security reasons
      return NextResponse.json(
        {
          message:
            "If your email is registered, you will receive a password reset link",
        },
        { status: 200 }
      );
    }

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
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    // Construct reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL}/password-reset/${token}`;

    // Send email with reset link
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || "noreply@example.com",
      to: email,
      subject: "Password Reset Request",
      text: `Please use the following link to reset your password: ${resetUrl}. This link is valid for 24 hours.`,
      html: `
        <div>
          <h1>Password Reset</h1>
          <p>Please use the following link to reset your password:</p>
          <a href="${resetUrl}" target="_blank">Reset Password</a>
          <p>This link is valid for 24 hours.</p>
        </div>
      `,
    });

    return NextResponse.json(
      {
        message:
          "If your email is registered, you will receive a password reset link",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error requesting password reset:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
