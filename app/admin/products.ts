/* eslint-disable @typescript-eslint/no-unused-vars */
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET" && req.query.topSelling === "true") {
    try {
      const topSellingProducts = await prisma.item.findMany({
        where: { topSelling: { gt: 0 } }, // Fetch items with topSelling rank greater than 0
        include: { images: true, reviews: true }, // Include reviews to calculate rating
      });

      const productsWithRating = topSellingProducts.map((product) => {
        const rating =
          product.reviews.reduce((acc, review) => acc + review.rating, 0) /
            product.reviews.length || 0;
        return { ...product, rating, slug: product.slug }; // Assurez-vous que le slug est inclus
      });

      console.log("Top-selling products:", productsWithRating); // Debug log
      res.status(200).json(productsWithRating);
    } catch (error) {
      console.error("Error retrieving top-selling products:", error); // Debug log
      res.status(500).json({ error: "Error retrieving top-selling products" });
    }
  } else if (req.method === "GET") {
    try {
      const products = await prisma.item.findMany(); // Corrected model name to 'item'
      res.status(200).json(
        products.map((product) => ({
          ...product,
          slug: product.slug, // Assurez-vous que le slug est inclus
        }))
      );
    } catch (error) {
      res.status(500).json({ error: "Error retrieving products" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
