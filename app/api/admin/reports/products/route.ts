/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get("timeframe") || "month";

    let daysLookback = 30; // Default to month

    switch (timeframe) {
      case "day":
        daysLookback = 1;
        break;
      case "week":
        daysLookback = 7;
        break;
      case "month":
        daysLookback = 30;
        break;
      case "quarter":
        daysLookback = 90;
        break;
      case "year":
        daysLookback = 365;
        break;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysLookback);

    // Get all order items to calculate sales per product
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: {
            gte: startDate,
          },
        },
      },
      include: {
        item: {
          include: {
            images: true,
            category: true,
          },
        },
      },
    });

    // Map to track sales per product
    const productSalesMap = new Map();

    orderItems.forEach((orderItem) => {
      const { item, quantity, price } = orderItem;
      const productId = item.id;

      if (!productSalesMap.has(productId)) {
        productSalesMap.set(productId, {
          id: productId,
          name: item.name,
          sales: 0,
          revenue: 0,
          stock: item.quantity,
          image: item.images?.[0]?.url || null,
          category: item.category?.name || "Uncategorized",
        });
      }

      const productStats = productSalesMap.get(productId);
      productStats.sales += quantity;
      productStats.revenue += price * quantity;
    });

    // Convert map to array and sort by sales (descending)
    const productSales = Array.from(productSalesMap.values())
      .map((product) => ({
        ...product,
        revenue: parseFloat(product.revenue.toFixed(2)),
      }))
      .sort((a, b) => b.sales - a.sales);

    // Get low stock products
    const lowStockProducts = await prisma.item.findMany({
      where: {
        quantity: {
          lte: 10, // Products with 10 or less in stock
        },
      },
      include: {
        images: true,
        category: true,
      },
      orderBy: {
        quantity: "asc",
      },
      take: 10,
    });

    // Calculate product inventory statistics
    const inventoryStats = {
      healthyStock: await prisma.item.count({
        where: { quantity: { gt: 10 } },
      }),
      lowStock: await prisma.item.count({
        where: { quantity: { gt: 0, lte: 10 } },
      }),
      outOfStock: await prisma.item.count({
        where: { quantity: { equals: 0 } },
      }),
      totalProducts: await prisma.item.count(),
    };

    return NextResponse.json({
      topProducts: productSales.slice(0, 10),
      worstPerformers: productSales.slice(-10).reverse(),
      lowStockProducts: lowStockProducts.map((product) => ({
        id: product.id,
        name: product.name,
        stock: product.quantity,
        image: product.images?.[0]?.url || null,
        category: product.category?.name || "Uncategorized",
      })),
      inventoryStats,
      categorySales: getCategorySales(productSales),
    });
  } catch (error) {
    console.error("[PRODUCTS_REPORT_GET]", error);
    return NextResponse.json(
      { error: "Failed to generate product report" },
      { status: 500 }
    );
  }
}

// Helper function to aggregate sales by category
function getCategorySales(productSales: any[]) {
  const categoryMap = new Map();

  productSales.forEach((product) => {
    const category = product.category;

    if (!categoryMap.has(category)) {
      categoryMap.set(category, {
        name: category,
        sales: 0,
        revenue: 0,
        products: 0,
      });
    }

    const categoryStats = categoryMap.get(category);
    categoryStats.sales += product.sales;
    categoryStats.revenue += product.revenue;
    categoryStats.products += 1;
  });

  return Array.from(categoryMap.values())
    .map((category) => ({
      ...category,
      revenue: parseFloat(category.revenue.toFixed(2)),
    }))
    .sort((a, b) => b.revenue - a.revenue);
}
