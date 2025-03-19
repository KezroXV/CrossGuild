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

    if (!content || !rating || !userId || !itemId) {
      return NextResponse.json(
        { error: "Content, rating, userId, and itemId are required" },
        { status: 400 }
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
