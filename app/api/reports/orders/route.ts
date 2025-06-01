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

    // Get order counts by status
    const totalOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });

    const pendingOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: startDate,
        },
        status: "pending",
      },
    });

    const processingOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: startDate,
        },
        status: "processing",
      },
    });

    const shippedOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: startDate,
        },
        status: "shipped",
      },
    });

    const deliveredOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: startDate,
        },
        status: "delivered",
      },
    });

    const cancelledOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: startDate,
        },
        status: "cancelled",
      },
    });

    // Get orders with creation date for processing time analysis
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        id: true,
        createdAt: true,
        status: true,
        total: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Group orders by day
    const ordersByDay = orders.reduce((acc: Record<string, any>, order) => {
      const date = order.createdAt.toISOString().split("T")[0];

      if (!acc[date]) {
        acc[date] = {
          date,
          count: 0,
          total: 0,
        };
      }

      acc[date].count += 1;
      acc[date].total += order.total;

      return acc;
    }, {});

    // Convert to array for charts
    const dailyOrderData = Object.values(ordersByDay).map((day: any) => ({
      name: day.date,
      orders: day.count,
      revenue: parseFloat(day.total.toFixed(2)),
    }));

    // Calculate statistics for processing times (assumes average for this example)
    // In a real application, you would calculate based on actual status change timestamps
    const avgProcessingTime = 1.2; // days
    const avgDeliveryTime = 3.5; // days
    const onTimeDeliveryRate = 94.5; // percent

    return NextResponse.json({
      orderCounts: {
        total: totalOrders,
        pending: pendingOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
      },
      dailyOrderData,
      processingMetrics: {
        avgProcessingTime,
        avgDeliveryTime,
        onTimeDeliveryRate,
      },
    });
  } catch (error) {
    console.error("[ORDERS_REPORT_GET]", error);
    return NextResponse.json(
      { error: "Failed to generate order report" },
      { status: 500 }
    );
  }
}
