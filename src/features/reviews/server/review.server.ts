import prisma from "@/shared/lib/prisma";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "@/shared/lib/handle-api-error";

const reviewUserInclude = {
  user: {
    select: {
      name: true,
      image: true,
    },
  },
} as const;

const adminReviewSelect = {
  id: true,
  content: true,
  rating: true,
  user: {
    select: {
      name: true,
      image: true,
    },
  },
  item: {
    select: {
      name: true,
      averageRating: true,
    },
  },
  createdAt: true,
} as const;

async function updateProductAverageRating(itemId: string) {
  const ratings = await prisma.review.findMany({
    where: { itemId },
    select: { rating: true },
  });

  const averageRating =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

  await prisma.item.update({
    where: { id: itemId },
    data: { averageRating },
  });
}

export async function getReviewsByProduct(itemId: string) {
  return prisma.review.findMany({
    where: { itemId },
    include: reviewUserInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function listAdminReviews() {
  return prisma.review.findMany({
    select: adminReviewSelect,
    orderBy: { createdAt: "desc" },
    take: 10,
  });
}

export async function createReview(
  userId: string,
  itemId: string,
  rating: number,
  content: string,
  options: { upsert?: boolean } = { upsert: true }
) {
  const [user, item] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.item.findUnique({ where: { id: itemId } }),
  ]);

  if (!user) {
    throw new NotFoundError("User not found. Please log in again.");
  }

  if (!item) {
    throw new NotFoundError("Product not found.");
  }

  const existingReview = await prisma.review.findFirst({
    where: { userId, itemId },
  });

  if (existingReview) {
    if (!options.upsert) {
      throw new ConflictError("You have already reviewed this product");
    }

    const updatedReview = await prisma.review.update({
      where: { id: existingReview.id },
      data: { rating, content },
      include: reviewUserInclude,
    });

    await updateProductAverageRating(itemId);
    return { review: updatedReview, updated: true as const };
  }

  const review = await prisma.review.create({
    data: { userId, itemId, rating, content },
    include: options.upsert ? reviewUserInclude : { user: true, item: true },
  });

  await updateProductAverageRating(itemId);
  return { review, updated: false as const };
}

export async function moderateReview(
  reviewId: string,
  data: {
    content?: string;
    rating?: number;
    userId?: string;
    itemId?: string;
  }
) {
  const existingReview = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { id: true, itemId: true },
  });

  if (!existingReview) {
    throw new NotFoundError("Review not found");
  }

  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data,
    include: { user: true, item: true },
  });

  const itemId = data.itemId ?? existingReview.itemId;
  await updateProductAverageRating(itemId);

  return updatedReview;
}

export async function deleteReview(
  reviewId: string,
  options?: { requesterId?: string; isAdmin?: boolean }
) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { userId: true, itemId: true },
  });

  if (!review) {
    throw new NotFoundError("Review not found");
  }

  if (
    options?.requesterId &&
    !options.isAdmin &&
    review.userId !== options.requesterId
  ) {
    throw new ForbiddenError("Unauthorized to delete this review");
  }

  await prisma.review.delete({
    where: { id: reviewId },
  });

  await updateProductAverageRating(review.itemId);
}
