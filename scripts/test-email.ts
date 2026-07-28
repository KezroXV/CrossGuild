import { sendEmail } from "@/shared/lib/email";

async function main() {
  const to = process.env.ALLOWED_TEST_EMAIL || "kezro10@gmail.com";
  console.log(`Testing email configuration (sending to ${to})...`);

  const result = await sendEmail({
    to,
    subject: "Test Email from CrossGuild",
    text: "If you're reading this, your email configuration is working!",
    html: "<p>If you're reading this, your email configuration is <strong>working</strong>!</p>",
  });

  if (result.success) {
    console.log("✅ Test email sent successfully");
  } else {
    console.error("❌ Email configuration failed:", result.error);
    process.exit(1);
  }
}

main().catch(console.error);
