/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/shared/lib/prisma";

export async function generateCustomSalesReport(
  startDate: Date,
  endDate: Date
) {
  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      orderItems: {
        include: {
          item: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });

  const salesByDate: {
    [key: string]: { date: string; sales: number; orders: number };
  } = {};

  orders.forEach((order) => {
    const dateStr = order.createdAt.toISOString().split("T")[0];

    if (!salesByDate[dateStr]) {
      salesByDate[dateStr] = {
        date: dateStr,
        sales: 0,
        orders: 0,
      };
    }

    salesByDate[dateStr].sales += order.total;
    salesByDate[dateStr].orders += 1;
  });

  const sortedData = Object.values(salesByDate).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return {
    totalSales: orders.reduce((sum, order) => sum + order.total, 0),
    totalOrders: orders.length,
    averageOrderValue:
      orders.length > 0
        ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length
        : 0,
    dailySales: sortedData,
  };
}

export async function generateCustomProductsReport(
  startDate: Date,
  endDate: Date
) {
  const orderItems = await prisma.orderItem.findMany({
    where: {
      order: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    },
    include: {
      item: {
        include: {
          category: true,
        },
      },
    },
  });

  const productPerformance: { [key: string]: any } = {};

  orderItems.forEach((orderItem) => {
    const { item, quantity, price } = orderItem;

    if (!productPerformance[item.id]) {
      productPerformance[item.id] = {
        id: item.id,
        name: item.name,
        category: item.category?.name || "Uncategorized",
        quantitySold: 0,
        revenue: 0,
        cost: item.cost || 0,
      };
    }

    productPerformance[item.id].quantitySold += quantity;
    productPerformance[item.id].revenue += quantity * price;
  });

  const productsArray = Object.values(productPerformance).map(
    (product: any) => ({
      ...product,
      profit: product.revenue - product.cost * product.quantitySold,
      margin:
        product.cost > 0
          ? (
              ((product.revenue - product.cost * product.quantitySold) /
                product.revenue) *
              100
            ).toFixed(2)
          : "N/A",
    })
  );

  productsArray.sort((a: any, b: any) => b.revenue - a.revenue);

  return {
    totalProducts: productsArray.length,
    totalRevenue: productsArray.reduce((sum, p: any) => sum + p.revenue, 0),
    totalProfit: productsArray.reduce((sum, p: any) => sum + p.profit, 0),
    products: productsArray,
  };
}
