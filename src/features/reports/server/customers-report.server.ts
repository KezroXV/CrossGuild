import prisma from "@/shared/lib/prisma";
import {
  resolveDateRange,
  type ReportDateParams,
} from "@/features/reports/server/report-utils.server";

export async function getCustomersReport(params: ReportDateParams = {}) {
  const { startDate, endDate } = resolveDateRange(params);

  const totalCustomers = await prisma.user.count({
    where: {
      isAdmin: false,
      createdAt: {
        gte: startDate,
      },
    },
  });

  const newCustomers = await prisma.user.count({
    where: {
      isAdmin: false,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

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

  const uniqueCustomersWithOrders = new Set(
    orders.map((order) => order.userId)
  ).size;

  const ordersPerUserMap = orders.reduce(
    (acc: Record<string, number>, order) => {
      const userId = order.userId;
      if (!acc[userId]) {
        acc[userId] = 0;
      }
      acc[userId] += 1;
      return acc;
    },
    {}
  );

  const repeatCustomers = Object.values(ordersPerUserMap).filter(
    (count) => count > 1
  ).length;

  const totalOrderValue = orders.reduce((sum, order) => sum + order.total, 0);
  const avgOrderValue =
    orders.length > 0 ? totalOrderValue / orders.length : 0;

  const customersByCountry = await prisma.user.groupBy({
    by: ["country"],
    where: {
      isAdmin: false,
      country: {
        not: null,
      },
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
  });

  let countryData = customersByCountry
    .filter((group) => group.country)
    .map((group) => ({
      country: group.country || "Unknown",
      customers: group._count.id,
    }))
    .sort((a, b) => b.customers - a.customers);

  if (countryData.length > 5) {
    const topCountries = countryData.slice(0, 5);
    const otherCountries = countryData.slice(5);
    const otherCount = otherCountries.reduce(
      (sum, item) => sum + item.customers,
      0
    );

    countryData = [
      ...topCountries,
      { country: "Other", customers: otherCount },
    ];
  }

  if (countryData.length === 0) {
    countryData = [{ country: "Unknown", customers: totalCustomers }];
  }

  return {
    totalCustomers,
    newCustomers,
    activeCustomers: uniqueCustomersWithOrders,
    repeatCustomers,
    newCustomerPercentage:
      totalCustomers > 0 ? (newCustomers / totalCustomers) * 100 : 0,
    repeatCustomerRate:
      uniqueCustomersWithOrders > 0
        ? (repeatCustomers / uniqueCustomersWithOrders) * 100
        : 0,
    avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
    estimatedLifetimeValue: parseFloat((avgOrderValue * 2.5).toFixed(2)),
    countryData,
  };
}
