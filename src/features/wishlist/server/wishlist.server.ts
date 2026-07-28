import prisma from "@/shared/lib/prisma";
import { NotFoundError } from "@/shared/lib/handle-api-error";

const wishlistItemInclude = {
  item: {
    include: {
      images: true,
      category: true,
      brand: true,
    },
  },
} as const;

export async function getWishlist(userId: string) {
  const wishlistItems = await prisma.wishlistItem.findMany({
    where: { userId },
    include: wishlistItemInclude,
  });

  return wishlistItems.map((wishlistItem) => ({
    ...wishlistItem.item,
    wishlistItemId: wishlistItem.id,
  }));
}

export async function addItem(userId: string, itemId: string) {
  const item = await prisma.item.findUnique({
    where: { id: itemId },
  });

  if (!item) {
    throw new NotFoundError("Article non trouvé");
  }

  const existingItem = await prisma.wishlistItem.findUnique({
    where: {
      userId_itemId: {
        userId,
        itemId,
      },
    },
  });

  if (existingItem) {
    return { alreadyExists: true as const };
  }

  await prisma.wishlistItem.create({
    data: {
      userId,
      itemId,
    },
  });

  return { alreadyExists: false as const };
}

export async function removeItem(userId: string, itemId: string) {
  const existingItem = await prisma.wishlistItem.findUnique({
    where: {
      userId_itemId: {
        userId,
        itemId,
      },
    },
  });

  if (!existingItem) {
    throw new NotFoundError("Article non trouvé dans la liste de souhaits");
  }

  await prisma.wishlistItem.delete({
    where: {
      userId_itemId: {
        userId,
        itemId,
      },
    },
  });
}

export async function isInWishlist(
  userId: string,
  itemId: string
): Promise<boolean> {
  const wishlistItem = await prisma.wishlistItem.findUnique({
    where: {
      userId_itemId: {
        userId,
        itemId,
      },
    },
  });

  return !!wishlistItem;
}

export async function getCount(userId: string): Promise<number> {
  return prisma.wishlistItem.count({
    where: { userId },
  });
}
