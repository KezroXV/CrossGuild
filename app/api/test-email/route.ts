import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function GET(req: Request) {
  try {
    // Get email from query params
    const url = new URL(req.url);
    const to = url.searchParams.get("email");

    if (!to) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    // HTML content
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1>Test Email from CrossGuild</h1>
        <p>This is a test email to verify that your email configuration is working correctly.</p>
        <p>If you received this, your email setup is working!</p>
        <p>Environment details:</p>
        <ul>
          <li>EMAIL_FROM: ${process.env.EMAIL_FROM}</li>
          <li>RESEND_API_KEY: ${process.env.RESEND_API_KEY ? "Configured" : "Missing"}</li>
          <li>NEXTAUTH_URL: ${process.env.NEXTAUTH_URL}</li>
        </ul>
      </div>
    `;

    // Send test email
    console.log(`Sending test email to: ${to}`);
    const result = await sendEmail({
      to,
      subject: "Test Email from CrossGuild",
      html,
      text: "This is a test email to verify that your email configuration is working correctly.",
    });

    if (!result.success) {
      console.error("Test email failed:", result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    console.log("Test email sent successfully");
    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      details: result.data,
    });
  } catch (error) {
    console.error("Error sending test email:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send test email" },
      { status: 500 }
    );
  }
}
