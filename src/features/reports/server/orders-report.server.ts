/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/shared/lib/prisma";
import {
  resolveDateRange,
  type ReportDateParams,
} from "@/features/reports/server/report-utils.server";

export async function getOrdersReport(params: ReportDateParams = {}) {
  const { startDate, endDate } = resolveDateRange(params);

  const dateFilter = {
    createdAt: {
      gte: startDate,
      lte: endDate,
    },
  };

  const [
    totalOrders,
    pendingOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    returnedOrders,
    orders,
  ] = await Promise.all([
    prisma.order.count({ where: dateFilter }),
    prisma.order.count({ where: { ...dateFilter, status: "pending" } }),
    prisma.order.count({ where: { ...dateFilter, status: "processing" } }),
    prisma.order.count({ where: { ...dateFilter, status: "shipped" } }),
    prisma.order.count({ where: { ...dateFilter, status: "delivered" } }),
    prisma.order.count({ where: { ...dateFilter, status: "cancelled" } }),
    prisma.order.count({ where: { ...dateFilter, status: "returned" } }),
    prisma.order.findMany({
      where: dateFilter,
      select: {
        id: true,
        createdAt: true,
        status: true,
        total: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    }),
  ]);

  const ordersByDay = orders.reduce((acc: Record<string, any>, order) => {
    const date = order.createdAt.toISOString().split("T")[0];

    if (!acc[date]) {
      acc[date] = {
        date,
        count: 0,
        total: 0,
        statuses: {},
      };
    }

    acc[date].count += 1;
    acc[date].total += order.total;

    if (!acc[date].statuses[order.status]) {
      acc[date].statuses[order.status] = 0;
    }

    acc[date].statuses[order.status] += 1;

    return acc;
  }, {});

  const dailyOrderData = Object.values(ordersByDay).map((day: any) => ({
    name: day.date,
    orders: day.count,
    revenue: parseFloat(day.total.toFixed(2)),
    ...day.statuses,
  }));

  return {
    orderCounts: {
      total: totalOrders,
      pending: pendingOrders,
      processing: processingOrders,
      shipped: shippedOrders,
      delivered: deliveredOrders,
      cancelled: cancelledOrders,
      returned: returnedOrders,
    },
    dailyOrderData,
    deliveryStats: {
      avgProcessingTime: 1.2,
      avgDeliveryTime: 3.5,
      onTimeDeliveryRate: 94.5,
    },
  };
}
