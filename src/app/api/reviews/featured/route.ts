import { NextResponse } from "next/server";
import { listAdminReviews } from "@/features/reviews/server/review.server";
import { handleApiError } from "@/shared/lib/handle-api-error";

export async function GET() {
  try {
    const reviews = await listAdminReviews();
    return NextResponse.json({ reviews: reviews ?? [] });
  } catch (error) {
    console.error("Error fetching featured reviews:", error);
    return handleApiError(error);
  }
}
