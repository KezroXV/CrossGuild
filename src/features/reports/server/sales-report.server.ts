/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/shared/lib/prisma";
import {
  getColorByIndex,
  getPreviousPeriodRange,
  resolveDateRange,
  type ReportDateParams,
} from "@/features/reports/server/report-utils.server";

async function getTotalSalesForRange(startDate: Date, endDate: Date) {
  const result = await prisma.order.aggregate({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      total: true,
    },
  });

  return result._sum.total ?? 0;
}

export async function getSalesReport(params: ReportDateParams = {}) {
  const { startDate, endDate } = resolveDateRange(params);
  const { previousStartDate, previousEndDate } = getPreviousPeriodRange(
    startDate,
    endDate
  );

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
    orderBy: {
      createdAt: "asc",
    },
  });

  const salesByDay = orders.reduce((acc: Record<string, any>, order) => {
    const date = order.createdAt.toISOString().split("T")[0];
    if (!acc[date]) {
      acc[date] = {
        date,
        sales: 0,
        profit: 0,
        orders: 0,
      };
    }
    acc[date].sales += order.total;
    acc[date].profit += order.total * 0.2;
    acc[date].orders += 1;
    return acc;
  }, {});

  const salesData = Object.values(salesByDay).map((day: any) => ({
    name: day.date,
    sales: parseFloat(day.sales.toFixed(2)),
    profit: parseFloat(day.profit.toFixed(2)),
    orders: day.orders,
  }));

  const salesByCategory: Record<string, number> = {};
  orders.forEach((order) => {
    order.orderItems.forEach((item) => {
      const categoryName = item.item.category?.name || "Uncategorized";
      if (!salesByCategory[categoryName]) {
        salesByCategory[categoryName] = 0;
      }
      salesByCategory[categoryName] += item.price * item.quantity;
    });
  });

  const categoryData = Object.entries(salesByCategory).map(
    ([name, value], index) => ({
      name,
      value: parseFloat(value.toFixed(2)),
      color: getColorByIndex(index),
    })
  );

  const currentTotal = salesData.reduce(
    (sum: number, day: any) => sum + day.sales,
    0
  );
  const previousTotal = await getTotalSalesForRange(
    previousStartDate,
    previousEndDate
  );
  const percentChange =
    previousTotal > 0
      ? ((currentTotal - previousTotal) / previousTotal) * 100
      : 0;

  return {
    salesData,
    categoryData,
    totalSales: currentTotal,
    totalOrders: salesData.reduce(
      (sum: number, day: any) => sum + day.orders,
      0
    ),
    totalProfit: salesData.reduce(
      (sum: number, day: any) => sum + day.profit,
      0
    ),
    comparison: {
      currentTotal: parseFloat(currentTotal.toFixed(2)),
      previousTotal: parseFloat(previousTotal.toFixed(2)),
      percentChange: parseFloat(percentChange.toFixed(1)),
    },
  };
}
