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

    // Récupérer toutes les commandes avec leurs articles
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

    // Calculer les achats par catégorie
    const categoryPurchases = new Map();
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

        const categoryData = categoryPurchases.get(categoryName);
        categoryData.count += orderItem.quantity;
        categoryData.revenue += orderItem.price * orderItem.quantity;
      });
    });

    // Calculer les pourcentages et le panier moyen
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

    // Agréger par segment client
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

    // Calculer la catégorie préférée par segment client
    const newUserCategoryMap = new Map();
    const returningUserCategoryMap = new Map();

    // Pour les nouveaux utilisateurs
    newUsers.forEach((user) => {
      user.orders.forEach((order) => {
        order.orderItems.forEach((orderItem) => {
          const categoryName = orderItem.item.category?.name || "Non classé";

          if (!newUserCategoryMap.has(categoryName)) {
            newUserCategoryMap.set(categoryName, 0);
          }

          newUserCategoryMap.set(
            categoryName,
            newUserCategoryMap.get(categoryName) + orderItem.quantity
          );
        });
      });
    });

    // Pour les utilisateurs fidèles
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
            returningUserCategoryMap.get(categoryName) + orderItem.quantity
          );
        });
      }
    });

    // Trouver les catégories principales par segment
    const getTopCategory = (map) => {
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

    const segmentPreferences = {
      newCustomers: getTopCategory(newUserCategoryMap),
      returningCustomers: getTopCategory(returningUserCategoryMap),
    };

    return NextResponse.json({
      categoryData,
      segmentPreferences,
      totalItems,
    });
  } catch (error) {
    console.error("[CUSTOMER_CATEGORIES_GET]", error);
    return NextResponse.json(
      { error: "Failed to generate customer categories report" },
      { status: 500 }
    );
  }
}
