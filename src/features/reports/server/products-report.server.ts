/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/shared/lib/prisma";
import {
  aggregateCategorySales,
  getDaysLookback,
} from "@/features/reports/server/report-utils.server";

export async function getProductsReport(params: { timeframe?: string } = {}) {
  const timeframe = params.timeframe || "month";
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - getDaysLookback(timeframe));

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

  const productSalesMap = new Map<string, any>();

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

    const productStats = productSalesMap.get(productId)!;
    productStats.sales += quantity;
    productStats.revenue += price * quantity;
  });

  const productSales = Array.from(productSalesMap.values())
    .map((product) => ({
      ...product,
      revenue: parseFloat(product.revenue.toFixed(2)),
    }))
    .sort((a, b) => b.sales - a.sales);

  const lowStockProducts = await prisma.item.findMany({
    where: {
      quantity: {
        lte: 10,
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

  return {
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
    categorySales: aggregateCategorySales(productSales),
  };
}

export async function getProfitabilityReport(params: {
  limit?: number;
  category?: string;
} = {}) {
  const limit = params.limit ?? 10;
  const category = params.category;

  const where: { categoryId?: string } = {};
  if (category) {
    where.categoryId = category;
  }

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

  const profitabilityData = products.map((product) => {
    const totalSales = product.orderItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

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

  return {
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
  };
}
