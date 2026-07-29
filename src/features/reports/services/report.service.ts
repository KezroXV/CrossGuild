import { API_BASE_URL } from "@/config/config";
import type {
  CategoryPerformanceData,
  CustomerCategoryData,
  CustomerCountryData,
  CustomerSegments,
  CustomReportTimeframe,
  CustomReportType,
  OrdersStats,
  ProductDataPoint,
  ProfitabilityData,
  ReportDateRange,
  ReportExportType,
  ReportFilters,
  ReportsData,
  SalesDataPoint,
  CategoryDataPoint,
} from "@/features/reports/types/report.type";

async function parseResponse<T>(res: Response): Promise<T> {
  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Request failed"
    );
  }

  return data as T;
}

function buildDateQuery(filters: ReportFilters): string {
  const { timeframe, dateRange } = filters;
  if (timeframe === "custom") {
    return `&from=${dateRange.from}&to=${dateRange.to}`;
  }
  return "";
}

export async function fetchReportsData(
  filters: ReportFilters
): Promise<ReportsData> {
  const { timeframe } = filters;
  const dateQuery = buildDateQuery(filters);
  const tf = `timeframe=${timeframe}`;

  const [
    salesResult,
    productsResult,
    profitabilityResult,
    customersResult,
    customerCategoriesResult,
    ordersResult,
    categoryPerformanceResult,
  ] = await Promise.all([
    fetch(`${API_BASE_URL}/api/admin/reports/sales?${tf}${dateQuery}`, {
      credentials: "include",
    }).then((res) => parseResponse<{ salesData: SalesDataPoint[]; categoryData: CategoryDataPoint[] }>(res)),
    fetch(`${API_BASE_URL}/api/admin/reports/products?${tf}`, {
      credentials: "include",
    }).then((res) => parseResponse<{ topProducts: ProductDataPoint[] }>(res)),
    fetch(`${API_BASE_URL}/api/admin/reports/products/profitability?limit=10`, {
      credentials: "include",
    }).then((res) => parseResponse<{ products: ProfitabilityData[] }>(res)),
    fetch(`${API_BASE_URL}/api/admin/reports/customers?${tf}`, {
      credentials: "include",
    }).then((res) => parseResponse<{ countryData: CustomerCountryData[] }>(res)),
    fetch(`${API_BASE_URL}/api/admin/reports/customers/categories?${tf}`, {
      credentials: "include",
    }).then((res) =>
      parseResponse<{
        categoryData: CustomerCategoryData[];
        segmentPreferences: CustomerSegments;
      }>(res)
    ),
    fetch(`${API_BASE_URL}/api/admin/reports/orders?${tf}`, {
      credentials: "include",
    }).then((res) =>
      parseResponse<{
        orderCounts: {
          total: number;
          delivered: number;
          processing: number;
          cancelled: number;
          returned: number;
        };
      }>(res)
    ),
    fetch(`${API_BASE_URL}/api/admin/reports/categories/performance?${tf}`, {
      credentials: "include",
    }).then((res) => parseResponse<CategoryPerformanceData>(res)),
  ]);

  const orderCounts = ordersResult.orderCounts;

  return {
    salesData: salesResult.salesData ?? [],
    categoryData: salesResult.categoryData ?? [],
    productData: productsResult.topProducts ?? [],
    profitabilityData: profitabilityResult.products ?? [],
    customerData: customersResult.countryData ?? [],
    customerCategoryData: customerCategoriesResult.categoryData ?? [],
    customerSegments: customerCategoriesResult.segmentPreferences ?? {
      newCustomers: "Data not available",
      returningCustomers: "Data not available",
    },
    ordersStats: {
      totalOrders: orderCounts?.total ?? 0,
      delivered: orderCounts?.delivered ?? 0,
      inProgress: orderCounts?.processing ?? 0,
      cancelled: orderCounts?.cancelled ?? 0,
      returned: orderCounts?.returned ?? 0,
    },
    categoryPerformance: categoryPerformanceResult,
  };
}

export async function fetchCustomReport(params: {
  reportType: CustomReportType;
  timeframe: CustomReportTimeframe;
  format: string;
}) {
  const searchParams = new URLSearchParams({
    reportType: params.reportType,
    timeframe: params.timeframe,
    format: params.format,
  });

  const res = await fetch(
    `${API_BASE_URL}/api/admin/reports/custom?${searchParams}`,
    { credentials: "include" }
  );

  return parseResponse<{ reportData: Record<string, unknown> }>(res);
}

export function downloadCsv(csvData: string, fileName: string) {
  const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportReportCsv(
  reportType: ReportExportType,
  data: Pick<
    ReportsData,
    | "salesData"
    | "productData"
    | "profitabilityData"
    | "customerData"
    | "ordersStats"
  >
) {
  let csvData: string;
  let fileName: string;

  switch (reportType) {
    case "sales":
      csvData =
        "Period,Sales,Profit\n" +
        data.salesData
          .map((d) => `${d.name},${d.sales},${d.profit}`)
          .join("\n");
      fileName = "sales-report.csv";
      break;
    case "products":
      csvData =
        "Product,Sales,Revenue,Stock\n" +
        data.productData
          .map((d) => `${d.name},${d.sales},${d.revenue},${d.stock}`)
          .join("\n");
      fileName = "products-report.csv";
      break;
    case "profitability":
      csvData =
        "Product,Cost,Price,Margin,Margin %,Total Profit\n" +
        data.profitabilityData
          .map(
            (d) =>
              `${d.name},${d.cost},${d.price},${d.margin},${d.marginPercentage},${d.totalProfit}`
          )
          .join("\n");
      fileName = "profitability-report.csv";
      break;
    case "customers":
      csvData =
        "Country,Customers\n" +
        data.customerData
          .map((d) => `${d.country},${d.customers}`)
          .join("\n");
      fileName = "customers-report.csv";
      break;
    case "orders": {
      const { ordersStats } = data;
      const total = ordersStats.totalOrders || 1;
      csvData =
        "Status,Count,Percentage\n" +
        `Delivered,${ordersStats.delivered},${Math.round((ordersStats.delivered / total) * 100)}%\n` +
        `In Progress,${ordersStats.inProgress},${Math.round((ordersStats.inProgress / total) * 100)}%\n` +
        `Cancelled,${ordersStats.cancelled},${Math.round((ordersStats.cancelled / total) * 100)}%\n` +
        `Returned,${ordersStats.returned},${Math.round((ordersStats.returned / total) * 100)}%\n`;
      fileName = "orders-report.csv";
      break;
    }
    default:
      return;
  }

  downloadCsv(csvData, fileName);
}

export function exportCustomReportCsv(
  reportType: CustomReportType,
  reportData: Record<string, unknown>
) {
  let csvData: string;
  let fileName: string;

  switch (reportType) {
    case "sales": {
      const dailySales = (reportData.dailySales ?? []) as Array<{
        date: string;
        sales: number;
        orders: number;
      }>;
      csvData =
        "Date,Sales,Orders\n" +
        dailySales
          .map((d) => `${d.date},${d.sales.toFixed(2)},${d.orders}`)
          .join("\n");
      fileName = "custom-sales-report.csv";
      break;
    }
    case "products": {
      const products = (reportData.products ?? []) as Array<{
        name: string;
        category: string;
        quantitySold: number;
        revenue: number;
        cost: number;
        profit: number;
        margin: string | number;
      }>;
      csvData =
        "Product,Category,Quantity Sold,Revenue,Cost,Profit,Margin\n" +
        products
          .map(
            (p) =>
              `"${p.name}","${p.category}",${p.quantitySold},${p.revenue.toFixed(2)},${p.cost.toFixed(2)},${p.profit.toFixed(2)},${p.margin}`
          )
          .join("\n");
      fileName = "custom-products-report.csv";
      break;
    }
    case "customers": {
      const customers = (reportData.customers ?? []) as Array<{
        id: string;
        name: string;
        email: string;
        orderCount: number;
        totalSpent: number;
        averageOrderValue: string | number;
      }>;
      csvData =
        "Customer ID,Name,Email,Orders,Total Spent,Avg Order Value\n" +
        customers
          .map(
            (c) =>
              `${c.id},"${c.name}",${c.email},${c.orderCount},${c.totalSpent.toFixed(2)},${c.averageOrderValue}`
          )
          .join("\n");
      fileName = "custom-customers-report.csv";
      break;
    }
    case "orders": {
      const dailyOrders = (reportData.dailyOrders ?? []) as Array<{
        date: string;
        count: number;
        revenue: number;
      }>;
      csvData =
        "Date,Orders,Revenue\n" +
        dailyOrders
          .map((d) => `${d.date},${d.count},${d.revenue.toFixed(2)}`)
          .join("\n");
      fileName = "custom-orders-report.csv";
      break;
    }
    default:
      csvData = "No data available";
      fileName = "custom-report.csv";
  }

  downloadCsv(csvData, fileName);
}

export function getDefaultDateRange(): ReportDateRange {
  return {
    from: new Date(new Date().setMonth(new Date().getMonth() - 1))
      .toISOString()
      .split("T")[0],
    to: new Date().toISOString().split("T")[0],
  };
}
