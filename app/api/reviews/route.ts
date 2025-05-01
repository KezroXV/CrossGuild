// ROUTE UTILISATEUR : Reviews produits (GET/POST/DELETE) - à utiliser côté client
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const itemId = url.searchParams.get("itemId");

  if (!itemId) {
    return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
  }

  try {
    const reviews = await prisma.review.findMany({
      where: { itemId },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId, rating, comment } = await request.json();

    if (!itemId || !rating) {
      return NextResponse.json(
        { error: "Item ID and rating are required" },
        { status: 400 }
      );
    }

    // Check if user has already reviewed this item
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: session.user.id as string,
        itemId,
      },
    });

    if (existingReview) {
      // Update existing review
      const updatedReview = await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating,
          content: comment, // Using content field instead of comment
        },
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      });

      // Update the product's average rating
      await updateProductRating(itemId);

      return NextResponse.json({
        message: "Review updated successfully",
        review: updatedReview,
      });
    }

    // Create new review
    const review = await prisma.review.create({
      data: {
        userId: session.user.id as string,
        itemId,
        rating,
        content: comment, // Using content field instead of comment
        isVerifiedPurchase: await hasUserPurchasedItem(
          session.user.id as string,
          itemId
        ),
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    // Update the product's average rating
    await updateProductRating(itemId);

    return NextResponse.json({
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const reviewId = url.searchParams.get("id");

    if (!reviewId) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
      );
    }

    // Get the review to check ownership and item ID
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { userId: true, itemId: true },
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Check if the user is the owner of the review or an admin
    if (review.userId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized to delete this review" },
        { status: 403 }
      );
    }

    // Delete the review
    await prisma.review.delete({
      where: { id: reviewId },
    });

    // Update the product's average rating
    await updateProductRating(review.itemId);

    return NextResponse.json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}

async function updateProductRating(itemId: string) {
  // Calculate new average rating
  const ratings = await prisma.review.findMany({
    where: { itemId },
    select: { rating: true },
  });

  if (ratings.length === 0) return;

  const averageRating =
    ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

  // Update the product
  await prisma.item.update({
    where: { id: itemId },
    data: { averageRating },
  });
}

async function hasUserPurchasedItem(
  userId: string,
  itemId: string
): Promise<boolean> {
  // Check if the user has purchased this item
  const purchases = await prisma.orderItem.findMany({
    where: {
      itemId,
      order: {
        userId,
        status: {
          in: ["delivered", "completed"],
        },
      },
    },
  });

  return purchases.length > 0;
}
