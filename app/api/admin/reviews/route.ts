import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        item: true,
        user: true,
      },
    });
    return NextResponse.json({ reviews: reviews || [] });
  } catch (error) {
    console.error("Error retrieving reviews:", error);
    return NextResponse.json(
      { error: "Failed to retrieve reviews" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

async function updateAverageRating(itemId: string) {
  const reviews = await prisma.review.findMany({
    where: { itemId },
    select: { rating: true },
  });

  const average =
    reviews.length > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      : 0;

  await prisma.item.update({
    where: { id: itemId },
    data: { averageRating: average },
  });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { content, rating, userId, itemId } = data;

    // Supprimer la validation en double
    if (!content) {
      return NextResponse.json(
        { error: "Review content is required" },
        { status: 400 }
      );
    }

    if (!rating) {
      return NextResponse.json(
        { error: "Rating is required" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is missing. Please log in again." },
        { status: 400 }
      );
    }

    if (!itemId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    console.log("Review submission received:", {
      content: content ? "provided" : "missing",
      rating,
      userId,
      itemId,
    });

    // Vérifier l'existence de l'utilisateur
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      console.error(`User with ID ${userId} not found`);
      return NextResponse.json(
        { error: "User not found. Please log in again." },
        { status: 404 }
      );
    }

    // Verify item exists
    const itemExists = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!itemExists) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    // Check if user has already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        itemId,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 409 }
      );
    }

    const newReview = await prisma.review.create({
      data: {
        content,
        rating: Number(rating),
        userId,
        itemId,
      },
      include: {
        user: true,
        item: true,
      },
    });

    await updateAverageRating(itemId);
    return NextResponse.json({ review: newReview }, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
      );
    }

    const review = await prisma.review.findUnique({
      where: { id },
      select: { itemId: true },
    });

    await prisma.review.delete({
      where: { id },
    });

    if (review) {
      await updateAverageRating(review.itemId);
    }

    return NextResponse.json({ message: "Review deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
