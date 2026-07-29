/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/shared/lib/prisma";

export async function generateCustomCustomersReport(
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
      user: true,
    },
  });

  const customerData: { [key: string]: any } = {};

  orders.forEach((order) => {
    if (!order.userId) return;

    if (!customerData[order.userId]) {
      customerData[order.userId] = {
        id: order.userId,
        name: order.user.name || "Anonymous",
        email: order.user.email || "No Email",
        orderCount: 0,
        totalSpent: 0,
      };
    }

    customerData[order.userId].orderCount += 1;
    customerData[order.userId].totalSpent += order.total;
  });

  const customersArray = Object.values(customerData).map((customer: any) => ({
    ...customer,
    averageOrderValue: (customer.totalSpent / customer.orderCount).toFixed(2),
  }));

  customersArray.sort((a: any, b: any) => b.totalSpent - a.totalSpent);

  return {
    totalCustomers: customersArray.length,
    totalRevenue: customersArray.reduce((sum, c: any) => sum + c.totalSpent, 0),
    averageLifetimeValue:
      customersArray.length > 0
        ? (
            customersArray.reduce((sum, c: any) => sum + c.totalSpent, 0) /
            customersArray.length
          ).toFixed(2)
        : 0,
    customers: customersArray,
  };
}

export async function generateCustomOrdersReport(
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
  });

  const statusCount: { [key: string]: number } = {};

  orders.forEach((order) => {
    if (!statusCount[order.status]) {
      statusCount[order.status] = 0;
    }
    statusCount[order.status] += 1;
  });

  const ordersByDate: {
    [key: string]: { date: string; count: number; revenue: number };
  } = {};

  orders.forEach((order) => {
    const dateStr = order.createdAt.toISOString().split("T")[0];

    if (!ordersByDate[dateStr]) {
      ordersByDate[dateStr] = {
        date: dateStr,
        count: 0,
        revenue: 0,
      };
    }

    ordersByDate[dateStr].count += 1;
    ordersByDate[dateStr].revenue += order.total;
  });

  const sortedData = Object.values(ordersByDate).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
    averageOrderValue:
      orders.length > 0
        ? (orders.reduce((sum, o) => sum + o.total, 0) / orders.length).toFixed(
            2
          )
        : 0,
    statusBreakdown: statusCount,
    dailyOrders: sortedData,
  };
}
