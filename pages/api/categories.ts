import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const categories = await prisma.category.findMany({
        select: {
          id: true,
          name: true,
          image: true,
          description: true,
          items: {
            select: {
              id: true,
            },
          },
        },
      });

      const categoriesWithItemCount = categories.map((category) => ({
        ...category,
        itemCount: category.items.length,
        items: undefined,
      }));

      res.status(200).json(categoriesWithItemCount);
    } catch (error) {
      console.error("Error retrieving categories:", error);
      res.status(500).json({ error: "Error retrieving categories" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
