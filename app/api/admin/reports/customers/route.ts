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
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");

    let startDate: Date;
    const endDate = toDate ? new Date(toDate) : new Date();

    // Set the start date based on the timeframe
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
        if (fromDate) {
          startDate = new Date(fromDate);
        } else {
          startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 1);
        }
        break;
      default:
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
    }

    // Get total count of users for the period
    const totalCustomers = await prisma.user.count({
      where: {
        isAdmin: false,
        createdAt: {
          gte: startDate,
        },
      },
    });

    // Get new customers in the period
    const newCustomers = await prisma.user.count({
      where: {
        isAdmin: false,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Get orders in the period
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

    // Get customer demographics by country
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

    // Format country data for charts
    let countryData = customersByCountry
      .filter((group) => group.country) // Filter out null countries
      .map((group) => ({
        country: group.country || "Unknown",
        customers: group._count.id,
      }))
      .sort((a, b) => b.customers - a.customers);

    // Add an "Other" category for countries with small counts
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

    // If no countries are found, provide some default data
    if (countryData.length === 0) {
      countryData = [{ country: "Unknown", customers: totalCustomers }];
    }

    return NextResponse.json({
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
      estimatedLifetimeValue: parseFloat((avgOrderValue * 2.5).toFixed(2)), // Simple LTV calculation
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
