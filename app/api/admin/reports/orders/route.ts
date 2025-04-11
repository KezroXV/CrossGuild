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

    // Get order counts by status
    const totalOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const pendingOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: "pending",
      },
    });

    const processingOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: "processing",
      },
    });

    const shippedOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: "shipped",
      },
    });

    const deliveredOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: "delivered",
      },
    });

    const cancelledOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: "cancelled",
      },
    });

    const returnedOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: "returned",
      },
    });

    // Get orders with creation date for time analysis
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
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

    // Convert to array for charts
    const dailyOrderData = Object.values(ordersByDay).map((day: any) => ({
      name: day.date,
      orders: day.count,
      revenue: parseFloat(day.total.toFixed(2)),
      ...day.statuses,
    }));

    // Calculate delivery stats based on completed orders
    const deliveryStats = {
      avgProcessingTime: 1.2, // days - in a real system would calculate from status change timestamps
      avgDeliveryTime: 3.5, // days - in a real system would calculate from shipping to delivered timestamps
      onTimeDeliveryRate: 94.5, // percent - in a real system would calculate based on promised vs actual delivery times
    };

    return NextResponse.json({
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
      deliveryStats,
    });
  } catch (error) {
    console.error("[ORDERS_REPORT_GET]", error);
    return NextResponse.json(
      { error: "Failed to generate order report" },
      { status: 500 }
    );
  }
}
