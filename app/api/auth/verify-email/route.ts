import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";

// Configure email transporter - use the same as in password-reset
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
    const { userId } = body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Email already verified" },
        { status: 200 }
      );
    }

    // Create a verification token
    const token = uuidv4();

    // Create or update verification token
    await prisma.verificationToken.upsert({
      where: { identifier: user.email || "" },
      update: {
        token,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
      create: {
        identifier: user.email || "",
        token,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Construct verification URL
    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email/${token}`;

    // Send verification email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || "noreply@example.com",
      to: user.email || "",
      subject: "Verify Your Email",
      text: `Please verify your email by clicking the following link: ${verificationUrl}. This link will expire in 24 hours.`,
      html: `
        <div>
          <h1>Email Verification</h1>
          <p>Welcome to CrossGuild! Please verify your email by clicking the button below:</p>
          <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
            Verify Email
          </a>
          <p>This link will expire in 24 hours.</p>
          <p>If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json(
      { message: "Verification email sent" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending verification email:", error);
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }
}
