import prisma from "@/shared/lib/prisma";

export async function searchProducts(query: string) {
  if (!query) {
    return [];
  }

  return prisma.item.findMany({
    where: {
      OR: [
        {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: query,
            mode: "insensitive",
          },
        },
      ],
    },
    include: {
      images: true,
    },
    take: 5,
  });
}
