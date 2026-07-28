/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/shared/lib/prisma";

export type ReportDateParams = {
  timeframe?: string;
  from?: string | null;
  to?: string | null;
};

function resolveDateRange({
  timeframe = "month",
  from,
  to,
}: ReportDateParams): { startDate: Date; endDate: Date } {
  let startDate: Date;
  const endDate = to ? new Date(to) : new Date();

  switch (timeframe) {
    case "day":
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      break;
    case "week":
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "month":
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case "quarter":
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);
      break;
    case "year":
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    case "custom":
      startDate = from ? new Date(from) : new Date();
      if (!from) {
        startDate.setMonth(startDate.getMonth() - 1);
      }
      break;
    default:
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
  }

  return { startDate, endDate };
}

function getDaysLookback(timeframe: string): number {
  switch (timeframe) {
    case "day":
      return 1;
    case "week":
      return 7;
    case "month":
      return 30;
    case "quarter":
      return 90;
    case "year":
      return 365;
    default:
      return 30;
  }
}

function getColorByIndex(index: number): string {
  const colors = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
    "#8AC054",
    "#5D9CEC",
    "#DADAEB",
    "#F49AC2",
  ];
  return colors[index % colors.length];
}

function aggregateCategorySales(productSales: any[]) {
  const categoryMap = new Map<string, any>();

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

    const categoryStats = categoryMap.get(category)!;
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

function getCustomReportStartDate(timeframe: string): Date {
  const now = new Date();
  const startDate = new Date(now);

  switch (timeframe) {
    case "today":
      startDate.setHours(0, 0, 0, 0);
      break;
    case "yesterday":
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "last7days":
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "last30days":
      startDate.setDate(startDate.getDate() - 30);
      break;
    case "thisMonth":
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "lastMonth":
      startDate.setMonth(startDate.getMonth() - 1);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "custom":
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    default:
      startDate.setMonth(startDate.getMonth() - 1);
  }

  return startDate;
}

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

export async function getSalesReport(params: ReportDateParams = {}) {
  const { startDate, endDate } = resolveDateRange(params);

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

  return {
    salesData,
    categoryData,
    totalSales: salesData.reduce((sum: number, day: any) => sum + day.sales, 0),
    totalOrders: salesData.reduce(
      (sum: number, day: any) => sum + day.orders,
      0
    ),
    totalProfit: salesData.reduce(
      (sum: number, day: any) => sum + day.profit,
      0
    ),
  };
}

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

async function generateCustomSalesReport(startDate: Date, endDate: Date) {
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

async function generateCustomProductsReport(startDate: Date, endDate: Date) {
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

async function generateCustomCustomersReport(startDate: Date, endDate: Date) {
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

async function generateCustomOrdersReport(startDate: Date, endDate: Date) {
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

export async function getCustomReport(params: {
  reportType?: string;
  timeframe?: string;
  format?: string;
} = {}) {
  const reportType = params.reportType || "sales";
  const timeframe = params.timeframe || "month";
  const format = params.format || "csv";

  const startDate = getCustomReportStartDate(timeframe);
  const endDate = new Date();

  let reportData;

  switch (reportType) {
    case "sales":
      reportData = await generateCustomSalesReport(startDate, endDate);
      break;
    case "products":
      reportData = await generateCustomProductsReport(startDate, endDate);
      break;
    case "customers":
      reportData = await generateCustomCustomersReport(startDate, endDate);
      break;
    case "orders":
      reportData = await generateCustomOrdersReport(startDate, endDate);
      break;
    default:
      reportData = await generateCustomSalesReport(startDate, endDate);
  }

  return {
    success: true,
    reportData,
    format,
    dateRange: {
      from: startDate,
      to: endDate,
    },
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

export async function getCategoryPerformanceReport(params: {
  timeframe?: string;
} = {}) {
  const timeframe = params.timeframe || "month";
  const startDate = new Date();

  switch (timeframe) {
    case "day":
      startDate.setDate(startDate.getDate() - 1);
      break;
    case "week":
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "month":
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case "quarter":
      startDate.setMonth(startDate.getMonth() - 3);
      break;
    case "year":
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
  }

  const categories = await prisma.category.findMany({
    include: {
      items: {
        include: {
          orderItems: {
            where: {
              order: {
                createdAt: {
                  gte: startDate,
                },
              },
            },
            include: {
              order: true,
            },
          },
          reviews: {
            where: {
              createdAt: {
                gte: startDate,
              },
            },
          },
        },
      },
    },
  });

  const categoryPerformance = categories.map((category) => {
    const totalStock = category.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    const totalSales = category.items.reduce((sum, item) => {
      return (
        sum +
        item.orderItems.reduce((orderSum, orderItem) => {
          return orderSum + orderItem.quantity;
        }, 0)
      );
    }, 0);

    const totalRevenue = category.items.reduce((sum, item) => {
      return (
        sum +
        item.orderItems.reduce((orderSum, orderItem) => {
          return orderSum + orderItem.price * orderItem.quantity;
        }, 0)
      );
    }, 0);

    const totalProfit = category.items.reduce((sum, item) => {
      const unitProfit = item.cost
        ? item.price - item.cost
        : item.price * 0.4;

      return (
        sum +
        item.orderItems.reduce((orderSum, orderItem) => {
          return orderSum + unitProfit * orderItem.quantity;
        }, 0)
      );
    }, 0);

    const totalReviews = category.items.reduce((sum, item) => {
      return sum + item.reviews.length;
    }, 0);

    let avgRating = 0;
    if (totalReviews > 0) {
      const sumRatings = category.items.reduce((sum, item) => {
        return (
          sum +
          item.reviews.reduce((reviewSum, review) => {
            return reviewSum + review.rating;
          }, 0)
        );
      }, 0);
      avgRating = sumRatings / totalReviews;
    }

    let avgMargin = 0;
    if (totalRevenue > 0) {
      avgMargin = (totalProfit / totalRevenue) * 100;
    }

    return {
      id: category.id,
      name: category.name,
      totalStock,
      totalSales,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalProfit: parseFloat(totalProfit.toFixed(2)),
      avgMargin: parseFloat(avgMargin.toFixed(2)),
      totalReviews,
      avgRating: parseFloat(avgRating.toFixed(1)),
    };
  });

  const brandCategoryRelations = await prisma.item.groupBy({
    by: ["brandId", "categoryId"],
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
    take: 10,
  });

  const popularRelations = await Promise.all(
    brandCategoryRelations.map(async (relation) => {
      const brand = relation.brandId
        ? await prisma.brand.findUnique({ where: { id: relation.brandId } })
        : null;

      const category = relation.categoryId
        ? await prisma.category.findUnique({
            where: { id: relation.categoryId },
          })
        : null;

      const itemCount = relation._count.id;
      const totalItems = await prisma.item.count();
      const percentage = parseFloat(
        ((itemCount / totalItems) * 100).toFixed(1)
      );

      return {
        brandId: relation.brandId,
        brandName: brand?.name || "Sans marque",
        categoryId: relation.categoryId,
        categoryName: category?.name || "Sans catégorie",
        itemCount,
        percentage,
      };
    })
  );

  const sortedByRevenue = [...categoryPerformance].sort(
    (a, b) => b.totalRevenue - a.totalRevenue
  );

  return {
    categoryPerformance: sortedByRevenue,
    mostProfitableCategory:
      [...categoryPerformance].sort((a, b) => b.avgMargin - a.avgMargin)[0] ||
      null,
    fastestGrowingCategory:
      [...categoryPerformance].sort((a, b) => b.totalSales - a.totalSales)[0] ||
      null,
    mostReviewedCategory:
      [...categoryPerformance].sort(
        (a, b) => b.totalReviews - a.totalReviews
      )[0] || null,
    popularBrandCategoryRelations: popularRelations,
  };
}

export async function getCustomerCategoriesReport(params: {
  timeframe?: string;
} = {}) {
  const timeframe = params.timeframe || "month";
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - getDaysLookback(timeframe));

  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startDate,
      },
    },
    include: {
      user: true,
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

  const categoryPurchases = new Map<string, any>();
  let totalItems = 0;

  orders.forEach((order) => {
    order.orderItems.forEach((orderItem) => {
      const categoryName = orderItem.item.category?.name || "Non classé";
      totalItems += orderItem.quantity;

      if (!categoryPurchases.has(categoryName)) {
        categoryPurchases.set(categoryName, {
          name: categoryName,
          count: 0,
          revenue: 0,
          avgOrderValue: 0,
        });
      }

      const categoryData = categoryPurchases.get(categoryName)!;
      categoryData.count += orderItem.quantity;
      categoryData.revenue += orderItem.price * orderItem.quantity;
    });
  });

  const categoryData = Array.from(categoryPurchases.values())
    .map((cat) => {
      const percentage = totalItems > 0 ? (cat.count / totalItems) * 100 : 0;
      const orderCount = orders.filter((order) =>
        order.orderItems.some((item) => item.item.category?.name === cat.name)
      ).length;

      return {
        name: cat.name,
        count: cat.count,
        percentage: parseFloat(percentage.toFixed(1)),
        revenue: parseFloat(cat.revenue.toFixed(2)),
        avgOrderValue:
          orderCount > 0
            ? parseFloat((cat.revenue / orderCount).toFixed(2))
            : 0,
      };
    })
    .sort((a, b) => b.percentage - a.percentage);

  const newUsers = await prisma.user.findMany({
    where: {
      createdAt: {
        gte: startDate,
      },
      orders: {
        some: {},
      },
    },
    include: {
      orders: {
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
      },
    },
  });

  const newUserCategoryMap = new Map<string, number>();
  const returningUserCategoryMap = new Map<string, number>();

  newUsers.forEach((user) => {
    user.orders.forEach((order) => {
      order.orderItems.forEach((orderItem) => {
        const categoryName = orderItem.item.category?.name || "Non classé";

        if (!newUserCategoryMap.has(categoryName)) {
          newUserCategoryMap.set(categoryName, 0);
        }

        newUserCategoryMap.set(
          categoryName,
          newUserCategoryMap.get(categoryName)! + orderItem.quantity
        );
      });
    });
  });

  const returningUserIds = new Set(
    orders
      .filter((order) => !newUsers.some((u) => u.id === order.userId))
      .map((order) => order.userId)
  );

  orders.forEach((order) => {
    if (returningUserIds.has(order.userId)) {
      order.orderItems.forEach((orderItem) => {
        const categoryName = orderItem.item.category?.name || "Non classé";

        if (!returningUserCategoryMap.has(categoryName)) {
          returningUserCategoryMap.set(categoryName, 0);
        }

        returningUserCategoryMap.set(
          categoryName,
          returningUserCategoryMap.get(categoryName)! + orderItem.quantity
        );
      });
    }
  });

  const getTopCategory = (map: Map<string, number>): string => {
    let max = 0;
    let topCategory = "Non classé";

    map.forEach((count, category) => {
      if (count > max) {
        max = count;
        topCategory = category;
      }
    });

    return topCategory;
  };

  return {
    categoryData,
    segmentPreferences: {
      newCustomers: getTopCategory(newUserCategoryMap),
      returningCustomers: getTopCategory(returningUserCategoryMap),
    },
    totalItems,
  };
}
