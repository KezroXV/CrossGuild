import { submitContactMessage } from "@/features/contact/server/contact.server";
import {
  handleApiError,
  ValidationError,
} from "@/shared/lib/handle-api-error";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const result = await submitContactMessage(data);

    const status = result.id.startsWith("temp-") ? 200 : 201;
    return Response.json(result, { status });
  } catch (error) {
    console.error("Error processing contact submission:", error);

    if (error instanceof ValidationError) {
      return handleApiError(error);
    }

    return Response.json(
      {
        success: true,
        message: "Message received",
      },
      { status: 200 }
    );
  }
}
