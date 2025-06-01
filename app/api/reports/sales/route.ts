/* eslint-disable @typescript-eslint/no-explicit-any */
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

    // Get sales data with aggregated totals
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

    // Group by date (for daily data)
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
      // Simple profit calculation (20% of total)
      acc[date].profit += order.total * 0.2;
      acc[date].orders += 1;
      return acc;
    }, {});

    // Convert to array format for charts
    const salesData = Object.values(salesByDay).map((day: any) => ({
      name: day.date,
      sales: parseFloat(day.sales.toFixed(2)),
      profit: parseFloat(day.profit.toFixed(2)),
      orders: day.orders,
    }));

    // Calculate sales by category
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

    // Format category data for chart
    const categoryData = Object.entries(salesByCategory).map(
      ([name, value], index) => ({
        name,
        value: parseFloat(value.toFixed(2)),
        color: getColorByIndex(index),
      })
    );

    return NextResponse.json({
      salesData,
      categoryData,
      totalSales: salesData.reduce(
        (sum: number, day: any) => sum + day.sales,
        0
      ),
      totalOrders: salesData.reduce(
        (sum: number, day: any) => sum + day.orders,
        0
      ),
      totalProfit: salesData.reduce(
        (sum: number, day: any) => sum + day.profit,
        0
      ),
    });
  } catch (error) {
    console.error("[REPORTS_SALES_GET]", error);
    return NextResponse.json(
      { error: "Failed to generate sales report" },
      { status: 500 }
    );
  }
}

// Helper function to get chart colors
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
