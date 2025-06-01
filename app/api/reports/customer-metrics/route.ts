import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
/**
 * Calculates date range based on timeframe
 */
function getDateRange(timeframe: string, from?: string, to?: string) {
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

  // Calculate previous period for comparison
  const timeDiff = now.getTime() - startDate.getTime();
  const previousEndDate = new Date(startDate);
  const previousStartDate = new Date(startDate.getTime() - timeDiff);

  return { startDate, endDate: now, previousStartDate, previousEndDate };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const timeframe = url.searchParams.get("timeframe") || "month";
  const from = url.searchParams.get("from") || undefined;
  const to = url.searchParams.get("to") || undefined;

  try {
    const { startDate, endDate, previousStartDate, previousEndDate } =
      getDateRange(timeframe, from?.toString(), to?.toString());

    // Get current period orders
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

    // Get previous period orders for comparison
    const previousOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: previousStartDate,
          lte: previousEndDate,
        },
      },
    });

    // Calculate average order value
    let totalValue = 0;
    for (const order of orders) {
      totalValue += order.total;
    }
    const avgOrderValue = orders.length > 0 ? totalValue / orders.length : 0;

    // Calculate previous period average order value for comparison
    let previousTotalValue = 0;
    for (const order of previousOrders) {
      previousTotalValue += order.total;
    }
    const previousAvgOrderValue =
      previousOrders.length > 0
        ? previousTotalValue / previousOrders.length
        : 0;

    // Calculate percent change
    const percentChange =
      previousAvgOrderValue > 0
        ? ((avgOrderValue - previousAvgOrderValue) / previousAvgOrderValue) *
          100
        : 0;

    // Group orders by user to find repeat customers
    const userOrderCounts = new Map();
    const userIds = new Set();

    for (const order of orders) {
      const userId = order.userId;
      userIds.add(userId);
      userOrderCounts.set(userId, (userOrderCounts.get(userId) || 0) + 1);
    }

    // Get unique users who placed orders
    const uniqueCustomers = userIds.size;

    // Count repeat customers (users with more than 1 order)
    const repeatCustomers = [...userOrderCounts.values()].filter(
      (count) => count > 1
    ).length;

    // Calculate repeat customer percentage
    const repeatCustomerPercentage =
      uniqueCustomers > 0 ? (repeatCustomers / uniqueCustomers) * 100 : 0;

    // Calculate customer lifetime value
    // This is a simplified calculation - in real applications, you might want to consider
    // customer retention rate, discount rate, etc.
    const totalOrders = orders.length;
    const avgOrdersPerCustomer =
      uniqueCustomers > 0 ? totalOrders / uniqueCustomers : 0;
    const customerLifetimeValue = avgOrderValue * avgOrdersPerCustomer;

    // Calculate new vs returning ratio
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

    return NextResponse.json({
      avgOrderValue,
      customerLifetimeValue,
      repeatCustomerPercentage,
      newVsReturningRatio,
      percentChange,
      totalOrders,
      uniqueCustomers,
    });
  } catch (error) {
    console.error("Error fetching customer metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer metrics" },
      { status: 500 }
    );
  }
}
