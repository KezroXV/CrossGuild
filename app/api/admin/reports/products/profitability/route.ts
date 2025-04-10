import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category") || undefined;

    // Construire la clause where pour le filtrage
    const where: any = {};

    if (category) {
      where.categoryId = category;
    }

    // Récupérer les produits avec leurs données de profitabilité
    const products = await prisma.item.findMany({
      where,
      select: {
        id: true,
        name: true,
        price: true,
        cost: true,
        profit: true,
        margin: true,
        topSelling: true,
        orderItems: {
          select: {
            quantity: true,
            price: true,
          },
        },
      },
      orderBy: {
        topSelling: "desc",
      },
      take: limit,
    });

    // Calculer le profit total pour chaque produit
    const profitabilityData = products.map((product) => {
      // Calculer le total des ventes (quantité × prix)
      const totalSales = product.orderItems.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );

      // Calculer le profit total (ventes - (coût × quantité vendue))
      const totalQuantitySold = product.orderItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      const totalCost = product.cost * totalQuantitySold;
      const totalProfit = totalSales - totalCost;

      return {
        id: product.id,
        name: product.name,
        cost: product.cost,
        price: product.price,
        margin: product.margin?.toFixed(2) || "0",
        marginPercentage: product.margin?.toFixed(1) || "0",
        totalSales: totalSales.toFixed(2),
        totalProfit: totalProfit.toFixed(2),
        unitsSold: totalQuantitySold,
      };
    });

    return NextResponse.json({
      products: profitabilityData,
      summary: {
        totalRevenue: profitabilityData
          .reduce((sum, prod) => sum + parseFloat(prod.totalSales), 0)
          .toFixed(2),
        totalProfit: profitabilityData
          .reduce((sum, prod) => sum + parseFloat(prod.totalProfit), 0)
          .toFixed(2),
        averageMargin:
          profitabilityData.length > 0
            ? (
                profitabilityData.reduce(
                  (sum, prod) => sum + parseFloat(prod.marginPercentage),
                  0
                ) / profitabilityData.length
              ).toFixed(1)
            : "0",
      },
    });
  } catch (error) {
    console.error("[PRODUCTS_PROFITABILITY_GET]", error);
    return NextResponse.json(
      { error: "Failed to generate product profitability report" },
      { status: 500 }
    );
  }
}
