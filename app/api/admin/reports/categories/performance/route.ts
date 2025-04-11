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

    // Calculer la date de début en fonction du timeframe
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

    // 1. Récupérer toutes les catégories
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

    // 2. Calculer les performances par catégorie
    const categoryPerformance = categories.map((category) => {
      // Somme des stocks pour cette catégorie
      const totalStock = category.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      // Somme des ventes pour cette catégorie
      const totalSales = category.items.reduce((sum, item) => {
        return (
          sum +
          item.orderItems.reduce((orderSum, orderItem) => {
            return orderSum + orderItem.quantity;
          }, 0)
        );
      }, 0);

      // Chiffre d'affaires pour cette catégorie
      const totalRevenue = category.items.reduce((sum, item) => {
        return (
          sum +
          item.orderItems.reduce((orderSum, orderItem) => {
            return orderSum + orderItem.price * orderItem.quantity;
          }, 0)
        );
      }, 0);

      // Profit (en supposant que nous avons les données de coût dans le schéma)
      const totalProfit = category.items.reduce((sum, item) => {
        // Calculer le profit unitaire (si cost existe, sinon estimer 40% du prix)
        const unitProfit = item.cost
          ? item.price - item.cost
          : item.price * 0.4;

        // Multiplier par la quantité vendue
        return (
          sum +
          item.orderItems.reduce((orderSum, orderItem) => {
            return orderSum + unitProfit * orderItem.quantity;
          }, 0)
        );
      }, 0);

      // Nombre total d'avis pour cette catégorie
      const totalReviews = category.items.reduce((sum, item) => {
        return sum + item.reviews.length;
      }, 0);

      // Note moyenne pour cette catégorie
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

      // Marge moyenne pour cette catégorie
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

    // 3. Obtenir les relations produit-marque les plus populaires
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

    // 4. Récupérer les détails des marques et catégories pour les relations
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

    // 5. Réponse finale
    return NextResponse.json({
      categoryPerformance: categoryPerformance.sort(
        (a, b) => b.totalRevenue - a.totalRevenue
      ),
      mostProfitableCategory:
        categoryPerformance.sort((a, b) => b.avgMargin - a.avgMargin)[0] ||
        null,
      fastestGrowingCategory:
        categoryPerformance.sort((a, b) => b.totalSales - a.totalSales)[0] ||
        null,
      mostReviewedCategory:
        categoryPerformance.sort(
          (a, b) => b.totalReviews - a.totalReviews
        )[0] || null,
      popularBrandCategoryRelations: popularRelations,
    });
  } catch (error) {
    console.error("[CATEGORY_PERFORMANCE_REPORT]", error);
    return NextResponse.json(
      { error: "Failed to generate category performance report" },
      { status: 500 }
    );
  }
}
