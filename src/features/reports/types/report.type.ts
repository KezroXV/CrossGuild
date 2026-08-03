export type ReportTimeframe =
  | "day"
  | "week"
  | "month"
  | "quarter"
  | "year"
  | "custom";

export type ReportDateRange = {
  from: string;
  to: string;
};

export type SalesDataPoint = {
  name: string;
  sales: number;
  profit: number;
  orders?: number;
};

export type CategoryDataPoint = {
  name: string;
  value: number;
  color: string;
};

export type ProductDataPoint = {
  name: string;
  sales: number;
  revenue: number;
  stock: number;
};

export type ProfitabilityData = {
  id: string | number;
  name: string;
  cost: number;
  price: number;
  margin: string | number;
  marginPercentage: string | number;
  totalProfit: string | number;
};

export type CustomerCountryData = {
  country: string;
  customers: number;
};

export type CustomerCategoryData = {
  name: string;
  percentage: number;
  avgOrderValue: number;
};

export type CustomerSegments = {
  newCustomers: string;
  returningCustomers: string;
};

export type OrdersStats = {
  totalOrders: number;
  delivered: number;
  inProgress: number;
  cancelled: number;
};

export type CategoryPerformanceItem = {
  name: string;
  totalStock: number;
  avgMargin?: number;
  totalSales?: number;
  avgRating?: number;
};

export type BrandCategoryRelation = {
  brandName: string;
  categoryName: string;
  percentage: number;
};

export type CategoryPerformanceData = {
  categoryPerformance: CategoryPerformanceItem[];
  mostProfitableCategory: CategoryPerformanceItem | null;
  fastestGrowingCategory: CategoryPerformanceItem | null;
  mostReviewedCategory: CategoryPerformanceItem | null;
  popularBrandCategoryRelations: BrandCategoryRelation[];
};

export type ReportExportType =
  | "sales"
  | "products"
  | "profitability"
  | "customers"
  | "orders";

export type CustomReportType = "sales" | "products" | "customers" | "orders";

export type CustomReportTimeframe =
  | "today"
  | "yesterday"
  | "last7days"
  | "last30days"
  | "thisMonth"
  | "lastMonth"
  | "custom";

export type SalesComparison = {
  currentTotal: number;
  previousTotal: number;
  percentChange: number;
};

export type ReportsData = {
  salesData: SalesDataPoint[];
  categoryData: CategoryDataPoint[];
  salesComparison: SalesComparison | null;
  productData: ProductDataPoint[];
  profitabilityData: ProfitabilityData[];
  customerData: CustomerCountryData[];
  customerCategoryData: CustomerCategoryData[];
  customerSegments: CustomerSegments;
  ordersStats: OrdersStats;
  categoryPerformance: CategoryPerformanceData;
};

export type ReportFilters = {
  timeframe: ReportTimeframe;
  dateRange: ReportDateRange;
};
