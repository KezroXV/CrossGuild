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
  ReportFilters,
  ReportsData,
  SalesComparison,
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
    }).then((res) =>
      parseResponse<{
        salesData: SalesDataPoint[];
        categoryData: CategoryDataPoint[];
        comparison?: SalesComparison;
      }>(res)
    ),
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
    salesComparison: salesResult.comparison ?? null,
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

export function getDefaultDateRange(): ReportDateRange {
  return {
    from: new Date(new Date().setMonth(new Date().getMonth() - 1))
      .toISOString()
      .split("T")[0],
    to: new Date().toISOString().split("T")[0],
  };
}

export {
  downloadCsv,
  exportCustomReportCsv,
  exportReportCsv,
} from "@/features/reports/services/report-export.service";
