import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  createReviewSchema,
  deleteReviewQuerySchema,
  reviewsByProductQuerySchema,
} from "@/features/reviews/validations/review.schema";
import {
  createReview,
  deleteReview,
  getReviewsByProduct,
} from "@/features/reviews/server/review.server";
import { withAuth } from "@/shared/lib/with-auth";
import {
  ForbiddenError,
  handleApiError,
  NotFoundError,
} from "@/shared/lib/handle-api-error";

export async function GET(request: Request) {
  try {
    const query = reviewsByProductQuerySchema.parse({
      itemId: new URL(request.url).searchParams.get("itemId"),
    });

    const reviews = await getReviewsByProduct(query.itemId);
    return NextResponse.json({ reviews });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    console.error("Error fetching reviews:", error);
    return handleApiError(error);
  }
}

export const POST = withAuth(async (request, { session }) => {
  try {
    const body = createReviewSchema.parse(await request.json());
    const result = await createReview(
      session.user.id,
      body.itemId,
      body.rating,
      body.comment ?? ""
    );

    return NextResponse.json({
      message: result.updated
        ? "Review updated successfully"
        : "Review submitted successfully",
      review: result.review,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Item ID and rating are required" },
        { status: 400 }
      );
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error("Error submitting review:", error);
    return handleApiError(error);
  }
});

export const DELETE = withAuth(async (request, { session }) => {
  try {
    const query = deleteReviewQuerySchema.parse({
      id: new URL(request.url).searchParams.get("id"),
    });

    await deleteReview(query.id, {
      requesterId: session.user.id,
      isAdmin: session.user.isAdmin,
    });

    return NextResponse.json({ message: "Review deleted successfully" });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
      );
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error("Error deleting review:", error);
    return handleApiError(error);
  }
});
