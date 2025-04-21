import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type SendEmailParams = {
  to: string;
  subject: string;
  text?: string;
  html: string;
  from?: string;
};

export async function sendEmail({
  to,
  subject,
  text,
  html,
  from = process.env.EMAIL_FROM || "onboarding@resend.dev",
}: SendEmailParams) {
  console.log(`Attempting to send email to: ${to}`);
  console.log(`From address: ${from}`);

  // In development, check if we're trying to send to a non-allowed email
  const isProduction = process.env.NODE_ENV === "production";
  const allowedTestingEmail =
    process.env.ALLOWED_TEST_EMAIL || "kezro10@gmail.com";

  if (!isProduction && to !== allowedTestingEmail) {
    console.log(
      `Development mode: Redirecting email from ${to} to ${allowedTestingEmail}`
    );
    console.log(`Original content would have been sent to: ${to}`);
    to = allowedTestingEmail;
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: isProduction ? subject : `[DEV TEST] ${subject}`,
      text,
      html,
    });

    if (error) {
      console.error("Resend API returned an error:", error);
      return { success: false, error };
    }

    console.log("Email sent successfully with ID:", data?.id);
    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

export function generatePasswordResetEmail(userName: string, resetUrl: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #333;">Password Reset</h1>
      </div>
      <div style="margin-bottom: 30px;">
        <p style="font-size: 16px; line-height: 1.5;">Hello ${userName || "User"},</p>
        <p style="font-size: 16px; line-height: 1.5;">We received a request to reset your password for your CrossGuild account.</p>
        <p style="font-size: 16px; line-height: 1.5;">Please click the button below to set a new password:</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Reset Password</a>
      </div>
      <div style="margin-top: 30px; font-size: 14px; color: #666; border-top: 1px solid #e0e0e0; padding-top: 20px;">
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
        <p>For security reasons, please do not forward this email to anyone.</p>
      </div>
    </div>
  `;

  const text = `
    Password Reset
    
    Hello ${userName || "User"},
    
    We received a request to reset your password for your CrossGuild account.
    
    Please use the following link to reset your password:
    ${resetUrl}
    
    This link will expire in 24 hours.
    
    If you didn't request a password reset, you can safely ignore this email.
    For security reasons, please do not forward this email to anyone.
  `;

  return { html, text };
}
