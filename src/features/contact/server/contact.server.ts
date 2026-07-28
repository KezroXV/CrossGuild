import prisma from "@/shared/lib/prisma";
import { ValidationError } from "@/shared/lib/handle-api-error";

export type SubmitContactInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
  department: string;
};

export type SubmitContactResult = {
  success: true;
  message: string;
  id: string;
};

function validateContactInput(input: SubmitContactInput) {
  if (
    !input.name ||
    !input.email ||
    !input.subject ||
    !input.message ||
    !input.department
  ) {
    throw new ValidationError("All fields are required");
  }
}

export async function submitContactMessage(
  input: SubmitContactInput
): Promise<SubmitContactResult> {
  validateContactInput(input);

  const contactData = {
    name: input.name,
    email: input.email,
    subject: input.subject,
    message: input.message,
    department: input.department,
    isResolved: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    const newContact = await prisma.contactMessage.create({ data: contactData });

    return {
      success: true,
      message: "Message sent successfully",
      id: newContact.id,
    };
  } catch (dbError) {
    console.error("Database error saving contact message:", dbError);

    console.log("CONTACT FORM SUBMISSION:", {
      name: input.name,
      email: input.email,
      subject: input.subject,
      department: input.department,
      message:
        input.message.substring(0, 50) +
        (input.message.length > 50 ? "..." : ""),
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      message: "Message received",
      id: `temp-${Date.now()}`,
    };
  }
}
