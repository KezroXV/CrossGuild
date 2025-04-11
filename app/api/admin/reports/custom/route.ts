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
    const reportType = searchParams.get("reportType") || "sales";
    const timeframe = searchParams.get("timeframe") || "month";
    const format = searchParams.get("format") || "csv";

    // Calculate date range based on timeframe
    const startDate = getStartDate(timeframe);
    const endDate = new Date();

    // Generate report based on type
    let reportData;

    switch (reportType) {
      case "sales":
        reportData = await generateSalesReport(startDate, endDate);
        break;
      case "products":
        reportData = await generateProductsReport(startDate, endDate);
        break;
      case "customers":
        reportData = await generateCustomersReport(startDate, endDate);
        break;
      case "orders":
        reportData = await generateOrdersReport(startDate, endDate);
        break;
      default:
        reportData = await generateSalesReport(startDate, endDate);
    }

    return NextResponse.json({
      success: true,
      reportData,
      format,
      dateRange: {
        from: startDate,
        to: endDate,
      },
    });
  } catch (error) {
    console.error("[CUSTOM_REPORT_GET]", error);
    return NextResponse.json(
      { error: "Failed to generate custom report" },
      { status: 500 }
    );
  }
}

// Helper to determine start date based on timeframe
function getStartDate(timeframe: string): Date {
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
      const lastDayOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        0
      ).getDate();
      startDate.setDate(lastDayOfMonth);
      break;
    case "custom":
      // For custom, we expect from/to params that would be handled separately
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    default:
      startDate.setMonth(startDate.getMonth() - 1);
  }

  return startDate;
}

// Report generators
async function generateSalesReport(startDate: Date, endDate: Date) {
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

  // Calculate total sales and organize by date
  const salesByDate = {};

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
    (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
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

async function generateProductsReport(startDate: Date, endDate: Date) {
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

  // Product performance analysis
  const productPerformance = {};

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

  // Convert to array and calculate profit
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

  // Sort by revenue
  productsArray.sort((a: any, b: any) => b.revenue - a.revenue);

  return {
    totalProducts: productsArray.length,
    totalRevenue: productsArray.reduce((sum, p: any) => sum + p.revenue, 0),
    totalProfit: productsArray.reduce((sum, p: any) => sum + p.profit, 0),
    products: productsArray,
  };
}

async function generateCustomersReport(startDate: Date, endDate: Date) {
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

  // Customer analysis
  const customerData = {};

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

  // Convert to array and calculate average order value
  const customersArray = Object.values(customerData).map((customer: any) => ({
    ...customer,
    averageOrderValue: (customer.totalSpent / customer.orderCount).toFixed(2),
  }));

  // Sort by total spent
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

async function generateOrdersReport(startDate: Date, endDate: Date) {
  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Order status breakdown
  const statusCount = {};

  orders.forEach((order) => {
    if (!statusCount[order.status]) {
      statusCount[order.status] = 0;
    }
    statusCount[order.status] += 1;
  });

  // Order by date
  const ordersByDate = {};

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
    (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
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
