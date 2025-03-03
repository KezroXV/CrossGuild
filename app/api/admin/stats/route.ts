import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalUsers,
      totalOrders,
      totalItems,
      recentOrders,
      totalRevenue,
      newUsers,
      recentReviews,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.item.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: true },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          image: true,
          createdAt: true,
        },
      }),
      prisma.review.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
          item: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      totalUsers,
      totalOrders,
      totalItems,
      recentOrders,
      revenue: totalRevenue._sum.total || 0,
      newUsers,
      recentReviews,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
