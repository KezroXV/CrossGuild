import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get("timeframe") || "month";

    let daysLookback = 30; // Default to month

    switch (timeframe) {
      case "day":
        daysLookback = 1;
        break;
      case "week":
        daysLookback = 7;
        break;
      case "month":
        daysLookback = 30;
        break;
      case "quarter":
        daysLookback = 90;
        break;
      case "year":
        daysLookback = 365;
        break;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysLookback);

    // Get total number of customers
    const totalCustomers = await prisma.user.count({
      where: {
        isAdmin: false,
      },
    });

    // Get new customers in the period
    const newCustomers = await prisma.user.count({
      where: {
        isAdmin: false,
        createdAt: {
          gte: startDate,
        },
      },
    });

    // Get orders in the period
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        user: true,
      },
    });

    // Count unique users who made orders in the period
    const uniqueCustomersWithOrders = new Set(
      orders.map((order) => order.userId)
    ).size;

    // Calculate orders per user
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

    // Count customers with multiple orders (repeat customers)
    const repeatCustomers = Object.values(ordersPerUserMap).filter(
      (count) => count > 1
    ).length;

    // Calculate average order value
    const totalOrderValue = orders.reduce((sum, order) => sum + order.total, 0);
    const avgOrderValue =
      orders.length > 0 ? totalOrderValue / orders.length : 0;

    // Get customer demographics by country (if available)
    const customersByCountry = await prisma.user.groupBy({
      by: ["country"],
      where: {
        isAdmin: false,
        country: {
          not: null,
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

    // Format country data for charts
    const countryData = customersByCountry.map((group) => ({
      country: group.country || "Unknown",
      customers: group._count.id,
    }));

    // Add an "Other" category for countries with small counts
    if (countryData.length > 5) {
      const topCountries = countryData.slice(0, 5);
      const otherCountries = countryData.slice(5);
      const otherCount = otherCountries.reduce(
        (sum, item) => sum + item.customers,
        0
      );

      const formattedCountryData = [
        ...topCountries,
        { country: "Other", customers: otherCount },
      ];

      return NextResponse.json({
        totalCustomers,
        newCustomers,
        activeCustomers: uniqueCustomersWithOrders,
        repeatCustomers,
        newCustomerPercentage:
          totalCustomers > 0 ? (newCustomers / totalCustomers) * 100 : 0,
        repeatCustomerPercentage:
          uniqueCustomersWithOrders > 0
            ? (repeatCustomers / uniqueCustomersWithOrders) * 100
            : 0,
        avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
        estimatedLifetimeValue: parseFloat((avgOrderValue * 2.5).toFixed(2)), // Simplified LTV calculation
        countryData: formattedCountryData,
      });
    }

    return NextResponse.json({
      totalCustomers,
      newCustomers,
      activeCustomers: uniqueCustomersWithOrders,
      repeatCustomers,
      newCustomerPercentage:
        totalCustomers > 0 ? (newCustomers / totalCustomers) * 100 : 0,
      repeatCustomerPercentage:
        uniqueCustomersWithOrders > 0
          ? (repeatCustomers / uniqueCustomersWithOrders) * 100
          : 0,
      avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
      estimatedLifetimeValue: parseFloat((avgOrderValue * 2.5).toFixed(2)), // Simplified LTV calculation
      countryData,
    });
  } catch (error) {
    console.error("[CUSTOMERS_REPORT_GET]", error);
    return NextResponse.json(
      { error: "Failed to generate customer report" },
      { status: 500 }
    );
  }
}
