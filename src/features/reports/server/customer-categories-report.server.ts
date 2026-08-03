import prisma from "@/shared/lib/prisma";
import { getDaysLookback } from "@/features/reports/server/report-utils.server";

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

  type CategoryPurchase = {
    name: string;
    count: number;
    revenue: number;
    avgOrderValue: number;
  };

  const categoryPurchases = new Map<string, CategoryPurchase>();
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
