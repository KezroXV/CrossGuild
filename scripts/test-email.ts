import nodemailer from "nodemailer";

async function main() {
  console.log("Testing email configuration...");

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
    secure: process.env.EMAIL_SERVER_SECURE === "true",
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  try {
    // Test connection
    await transporter.verify();
    console.log("✅ SMTP connection successful");

    // Send test email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: "your-test-email@example.com", // Change this to your test email
      subject: "Test Email from CrossGuild",
      text: "If you're reading this, your email configuration is working!",
      html: "<p>If you're reading this, your email configuration is <strong>working</strong>!</p>",
    });

    console.log("✅ Test email sent successfully");
    console.log("Message ID:", info.messageId);
  } catch (error) {
    console.error("❌ Email configuration failed:", error);
  }
}

main().catch(console.error);
