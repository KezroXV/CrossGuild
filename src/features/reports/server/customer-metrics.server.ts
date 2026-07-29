import prisma from "@/shared/lib/prisma";
import {
  resolveDateRange,
  type ReportDateParams,
} from "@/features/reports/server/report-utils.server";

function getCustomerMetricsDateRange(
  timeframe: string,
  from?: string,
  to?: string
) {
  const now = new Date();
  let startDate = new Date();

  if (timeframe === "custom" && from && to) {
    return {
      startDate: new Date(from),
      endDate: new Date(to),
      previousStartDate: new Date(
        new Date(from).getTime() -
          (new Date(to).getTime() - new Date(from).getTime())
      ),
      previousEndDate: new Date(from),
    };
  }

  switch (timeframe) {
    case "day":
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "week":
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case "month":
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      break;
    case "quarter":
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 3);
      break;
    case "year":
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
  }

  const timeDiff = now.getTime() - startDate.getTime();
  const previousEndDate = new Date(startDate);
  const previousStartDate = new Date(startDate.getTime() - timeDiff);

  return { startDate, endDate: now, previousStartDate, previousEndDate };
}

export async function getCustomerMetrics(params: ReportDateParams = {}) {
  const timeframe = params.timeframe || "month";
  const { startDate, endDate, previousStartDate, previousEndDate } =
    getCustomerMetricsDateRange(
      timeframe,
      params.from ?? undefined,
      params.to ?? undefined
    );

  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      user: true,
      orderItems: true,
    },
  });

  const previousOrders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: previousStartDate,
        lte: previousEndDate,
      },
    },
  });

  let totalValue = 0;
  for (const order of orders) {
    totalValue += order.total;
  }
  const avgOrderValue = orders.length > 0 ? totalValue / orders.length : 0;

  let previousTotalValue = 0;
  for (const order of previousOrders) {
    previousTotalValue += order.total;
  }
  const previousAvgOrderValue =
    previousOrders.length > 0
      ? previousTotalValue / previousOrders.length
      : 0;

  const percentChange =
    previousAvgOrderValue > 0
      ? ((avgOrderValue - previousAvgOrderValue) / previousAvgOrderValue) * 100
      : 0;

  const userOrderCounts = new Map<string, number>();
  const userIds = new Set<string>();

  for (const order of orders) {
    const userId = order.userId;
    userIds.add(userId);
    userOrderCounts.set(userId, (userOrderCounts.get(userId) || 0) + 1);
  }

  const uniqueCustomers = userIds.size;
  const repeatCustomers = [...userOrderCounts.values()].filter(
    (count) => count > 1
  ).length;

  const repeatCustomerPercentage =
    uniqueCustomers > 0 ? (repeatCustomers / uniqueCustomers) * 100 : 0;

  const totalOrders = orders.length;
  const avgOrdersPerCustomer =
    uniqueCustomers > 0 ? totalOrders / uniqueCustomers : 0;
  const customerLifetimeValue = avgOrderValue * avgOrdersPerCustomer;

  const newCustomers = uniqueCustomers - repeatCustomers;
  const newPercentage =
    uniqueCustomers > 0
      ? Math.round((newCustomers / uniqueCustomers) * 100)
      : 0;
  const returningPercentage =
    uniqueCustomers > 0
      ? Math.round((repeatCustomers / uniqueCustomers) * 100)
      : 0;
  const newVsReturningRatio = `${newPercentage}% / ${returningPercentage}%`;

  return {
    avgOrderValue,
    customerLifetimeValue,
    repeatCustomerPercentage,
    newVsReturningRatio,
    percentChange,
    totalOrders,
    uniqueCustomers,
  };
}
