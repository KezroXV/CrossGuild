import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") || "reviews";

  try {
    if (type === "faqs") {
      const page = parseInt(url.searchParams.get("page") || "1");
      const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
      const search = url.searchParams.get("search") || "";

      const skip = (page - 1) * pageSize;

      // Add search for FAQs
      const where = search
        ? {
            OR: [
              { question: { contains: search, mode: "insensitive" } },
              { answer: { contains: search, mode: "insensitive" } },
            ],
          }
        : {};

      const [faqs, count] = await Promise.all([
        prisma.fAQ.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { createdAt: "desc" },
        }),
        prisma.fAQ.count({ where }),
      ]);

      return NextResponse.json({
        faqs: faqs || [],
        totalCount: count,
        totalPages: Math.ceil(count / pageSize),
      });
    } else {
      const page = parseInt(url.searchParams.get("page") || "1");
      const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
      const search = url.searchParams.get("search") || "";

      const skip = (page - 1) * pageSize;

      const where = search
        ? {
            OR: [
              { content: { contains: search, mode: "insensitive" } },
              { user: { name: { contains: search, mode: "insensitive" } } },
              { item: { name: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {};

      const [reviews, count] = await Promise.all([
        prisma.review.findMany({
          where,
          include: {
            item: true,
            user: true,
          },
          skip,
          take: pageSize,
          orderBy: { createdAt: "desc" },
        }),
        prisma.review.count({ where }),
      ]);

      return NextResponse.json({
        reviews: reviews || [],
        totalCount: count,
        totalPages: Math.ceil(count / pageSize),
      });
    }
  } catch (error) {
    console.error(`Error retrieving ${type}:`, error);
    return NextResponse.json(
      { error: `Failed to retrieve ${type}` },
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
    const data = await request.json();
    const { id, type } = data;

    if (type === "faq") {
      if (!id) {
        return NextResponse.json(
          { error: "FAQ ID is required" },
          { status: 400 }
        );
      }

      await prisma.fAQ.delete({
        where: { id },
      });

      return NextResponse.json({ message: "FAQ deleted" }, { status: 200 });
    } else {
      // Handle review deletion (existing code)
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
    }
  } catch (error) {
    console.error("Error deleting:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Add FAQ endpoints
export async function PUT(request: Request) {
  try {
    const data = await request.json();

    if (data.type === "faq") {
      const { id, question, answer, isPublished } = data;

      const updatedFaq = await prisma.fAQ.update({
        where: { id },
        data: {
          question,
          answer,
          isPublished,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({ faq: updatedFaq }, { status: 200 });
    } else {
      // Handle review updates
      const { id, data: reviewData } = data;

      const updatedReview = await prisma.review.update({
        where: { id },
        data: reviewData,
        include: {
          user: true,
          item: true,
        },
      });

      return NextResponse.json({ review: updatedReview }, { status: 200 });
    }
  } catch (error) {
    console.error("Error updating:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Add an endpoint for FAQ creation
export async function PATCH(request: Request) {
  try {
    const { question } = await request.json();

    if (!question) {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    const newFaq = await prisma.fAQ.create({
      data: {
        question,
        answer: "",
        isPublished: false,
      },
    });

    return NextResponse.json({ faq: newFaq }, { status: 201 });
  } catch (error) {
    console.error("Error creating FAQ:", error);
    return NextResponse.json(
      { error: "Failed to create FAQ" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
