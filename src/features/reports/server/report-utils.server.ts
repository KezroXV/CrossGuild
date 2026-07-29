/* eslint-disable @typescript-eslint/no-explicit-any */

export type ReportDateParams = {
  timeframe?: string;
  from?: string | null;
  to?: string | null;
};

export function resolveDateRange({
  timeframe = "month",
  from,
  to,
}: ReportDateParams): { startDate: Date; endDate: Date } {
  let startDate: Date;
  const endDate = to ? new Date(to) : new Date();

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
      startDate = from ? new Date(from) : new Date();
      if (!from) {
        startDate.setMonth(startDate.getMonth() - 1);
      }
      break;
    default:
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
  }

  return { startDate, endDate };
}

export function getPreviousPeriodRange(startDate: Date, endDate: Date) {
  const timeDiff = endDate.getTime() - startDate.getTime();
  const previousEndDate = new Date(startDate);
  const previousStartDate = new Date(startDate.getTime() - timeDiff);
  return { previousStartDate, previousEndDate };
}

export function getDaysLookback(timeframe: string): number {
  switch (timeframe) {
    case "day":
      return 1;
    case "week":
      return 7;
    case "month":
      return 30;
    case "quarter":
      return 90;
    case "year":
      return 365;
    default:
      return 30;
  }
}

export function getColorByIndex(index: number): string {
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

export function aggregateCategorySales(productSales: any[]) {
  const categoryMap = new Map<string, any>();

  productSales.forEach((product) => {
    const category = product.category;

    if (!categoryMap.has(category)) {
      categoryMap.set(category, {
        name: category,
        sales: 0,
        revenue: 0,
        products: 0,
      });
    }

    const categoryStats = categoryMap.get(category)!;
    categoryStats.sales += product.sales;
    categoryStats.revenue += product.revenue;
    categoryStats.products += 1;
  });

  return Array.from(categoryMap.values())
    .map((category) => ({
      ...category,
      revenue: parseFloat(category.revenue.toFixed(2)),
    }))
    .sort((a, b) => b.revenue - a.revenue);
}
