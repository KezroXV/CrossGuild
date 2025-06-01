"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Chart components
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Empty state component
const EmptyState = ({ message = "No data available" }) => (
  <div className="flex flex-col items-center justify-center h-64 border rounded-md">
    <p className="text-muted-foreground">{message}</p>
    <Button variant="outline" className="mt-4">
      Refresh Data
    </Button>
  </div>
);

// Sample data - will be replaced with actual API data
const sampleSalesData = [
  { name: "Jan", sales: 4000, profit: 2400 },
  { name: "Feb", sales: 3000, profit: 1398 },
  { name: "Mar", sales: 2000, profit: 9800 },
  { name: "Apr", sales: 2780, profit: 3908 },
  { name: "May", sales: 1890, profit: 4800 },
  { name: "Jun", sales: 2390, profit: 3800 },
  { name: "Jul", sales: 3490, profit: 4300 },
];

const sampleCategoryData = [
  { name: "Gaming", value: 400, color: "#FF6384" },
  { name: "Accessories", value: 300, color: "#36A2EB" },
  { name: "Computers", value: 300, color: "#FFCE56" },
  { name: "Components", value: 200, color: "#4BC0C0" },
  { name: "Peripherals", value: 100, color: "#9966FF" },
];

const sampleProductData = [
  { name: "Gaming Mouse X1", sales: 120, revenue: 3600, stock: 45 },
  { name: "Mechanical Keyboard Pro", sales: 95, revenue: 9500, stock: 23 },
  { name: "Ultra HD Monitor", sales: 80, revenue: 12000, stock: 12 },
  { name: "Gaming Headset", sales: 75, revenue: 5250, stock: 30 },
  { name: "RGB Mouse Pad XL", sales: 60, revenue: 1800, stock: 65 },
];

const sampleCustomerData = [
  { country: "United States", customers: 450 },
  { country: "Canada", customers: 230 },
  { country: "United Kingdom", customers: 200 },
  { country: "Germany", customers: 180 },
  { country: "France", customers: 150 },
  { country: "Other", customers: 420 },
];

const sampleOrdersStats = {
  totalOrders: 856,
  delivered: 740,
  inProgress: 56,
  cancelled: 32,
  returned: 28,
};

export default function ReportsPage() {
  const [timeframe, setTimeframe] = useState("month");
  const [compareMode, setCompareMode] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1))
      .toISOString()
      .split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });
  const [salesData, setSalesData] = useState(sampleSalesData);
  const [categoryData, setCategoryData] = useState(sampleCategoryData);
  const [productData, setProductData] = useState(sampleProductData);
  const [profitabilityData, setProfitabilityData] = useState<
    ProfitabilityData[]
  >([]);
  interface CustomerCategoryData {
    name: string;
    percentage: number;
    avgOrderValue: number;
  }

  const [customerData, setCustomerData] = useState(sampleCustomerData);
  const [ordersStats, setOrdersStats] = useState(sampleOrdersStats);
  const [customerCategoryData, setCustomerCategoryData] = useState<
    CustomerCategoryData[]
  >([]);
  const [customerSegments, setCustomerSegments] = useState({
    newCustomers: "Loading...",
    returningCustomers: "Loading...",
  });

  interface CategoryPerformanceItem {
    name: string;
    totalStock: number;
    avgMargin?: number;
    totalSales?: number;
    avgRating?: number;
  }

  interface BrandCategoryRelation {
    brandName: string;
    categoryName: string;
    percentage: number;
  }

  interface CategoryPerformanceData {
    categoryPerformance: CategoryPerformanceItem[];
    mostProfitableCategory: CategoryPerformanceItem | null;
    fastestGrowingCategory: CategoryPerformanceItem | null;
    mostReviewedCategory: CategoryPerformanceItem | null;
    popularBrandCategoryRelations: BrandCategoryRelation[];
  }

  const [categoryPerformance, setCategoryPerformance] =
    useState<CategoryPerformanceData>({
      categoryPerformance: [],
      mostProfitableCategory: null,
      fastestGrowingCategory: null,
      mostReviewedCategory: null,
      popularBrandCategoryRelations: [],
    });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [reportType, setReportType] = useState("sales");
  const [reportTimeframe, setReportTimeframe] = useState("last30days");
  const [reportFormat, setReportFormat] = useState("csv");

  // Fetch data based on selected timeframe
  useEffect(() => {
    const fetchReportData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const salesResponse = await fetch(
          `/api/admin/reports/sales?timeframe=${timeframe}${
            timeframe === "custom"
              ? `&from=${dateRange.from}&to=${dateRange.to}`
              : ""
          }`
        );

        if (!salesResponse.ok) {
          throw new Error("Failed to fetch sales data");
        }

        const salesResult = await salesResponse.json();
        setSalesData(salesResult.salesData || sampleSalesData);
        setCategoryData(salesResult.categoryData || sampleCategoryData);

        const productsResponse = await fetch(
          `/api/admin/reports/products?timeframe=${timeframe}`
        );

        if (!productsResponse.ok) {
          throw new Error("Failed to fetch product data");
        }

        const productsResult = await productsResponse.json();
        setProductData(productsResult.topProducts || sampleProductData);

        const profitabilityResponse = await fetch(
          `/api/admin/reports/products/profitability?limit=10`
        );

        if (!profitabilityResponse.ok) {
          throw new Error("Failed to fetch profitability data");
        }

        const profitabilityResult = await profitabilityResponse.json();
        setProfitabilityData(profitabilityResult.products || []);

        const customersResponse = await fetch(
          `/api/admin/reports/customers?timeframe=${timeframe}`
        );

        if (!customersResponse.ok) {
          throw new Error("Failed to fetch customer data");
        }

        const customersResult = await customersResponse.json();
        setCustomerData(customersResult.countryData || sampleCustomerData);

        const customerCategoriesResponse = await fetch(
          `/api/admin/reports/customers/categories?timeframe=${timeframe}`
        );

        if (customerCategoriesResponse.ok) {
          const categoriesResult = await customerCategoriesResponse.json();
          setCustomerCategoryData(categoriesResult.categoryData || []);
          setCustomerSegments(
            categoriesResult.segmentPreferences || {
              newCustomers: "Data not available",
              returningCustomers: "Data not available",
            }
          );
        }

        const ordersResponse = await fetch(
          `/api/admin/reports/orders?timeframe=${timeframe}`
        );

        if (!ordersResponse.ok) {
          throw new Error("Failed to fetch orders data");
        }

        const ordersResult = await ordersResponse.json();
        if (ordersResult.orderCounts) {
          setOrdersStats({
            totalOrders: ordersResult.orderCounts.total || 0,
            delivered: ordersResult.orderCounts.delivered || 0,
            inProgress: ordersResult.orderCounts.processing || 0,
            cancelled: ordersResult.orderCounts.cancelled || 0,
            returned: ordersResult.orderCounts.returned || 0,
          });
        }

        const categoryPerformanceResponse = await fetch(
          `/api/admin/reports/categories/performance?timeframe=${timeframe}`
        );

        if (categoryPerformanceResponse.ok) {
          const performanceResult = await categoryPerformanceResponse.json();
          setCategoryPerformance(performanceResult);
        }
      } catch (error) {
        console.error("Error fetching report data:", error);
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, [timeframe, dateRange]);

  // Handle date selection for custom ranges
  interface DateRange {
    from: string;
    to: string;
  }

  const handleDateChange = (field: keyof DateRange, value: string): void => {
    setDateRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Export reports as CSV
  // Export report types
  interface SalesData {
    name: string;
    sales: number;
    profit: number;
  }

  interface ProductData {
    name: string;
    sales: number;
    revenue: number;
    stock: number;
  }

  interface ProfitabilityData {
    id: number;
    name: string;
    cost: number;
    price: number;
    margin: number;
    marginPercentage: number;
    totalProfit: number;
  }

  interface CustomerData {
    country: string;
    customers: number;
  }

  type ReportType =
    | "sales"
    | "products"
    | "profitability"
    | "customers"
    | "orders";

  const handleExportCSV = (reportType: ReportType): void => {
    let csvData: string;
    let fileName: string;

    switch (reportType) {
      case "sales":
        csvData =
          "Period,Sales,Profit\n" +
          salesData
            .map((d: SalesData) => `${d.name},${d.sales},${d.profit}`)
            .join("\n");
        fileName = "sales-report.csv";
        break;
      case "products":
        csvData =
          "Product,Sales,Revenue,Stock\n" +
          productData
            .map(
              (d: ProductData) => `${d.name},${d.sales},${d.revenue},${d.stock}`
            )
            .join("\n");
        fileName = "products-report.csv";
        break;
      case "profitability":
        csvData =
          "Product,Cost,Price,Margin,Margin %,Total Profit\n" +
          profitabilityData
            .map(
              (d: ProfitabilityData) =>
                `${d.name},${d.cost},${d.price},${d.margin},${d.marginPercentage},${d.totalProfit}`
            )
            .join("\n");
        fileName = "profitability-report.csv";
        break;
      case "customers":
        csvData =
          "Country,Customers\n" +
          customerData
            .map((d: CustomerData) => `${d.country},${d.customers}`)
            .join("\n");
        fileName = "customers-report.csv";
        break;
      case "orders":
        csvData =
          "Status,Count,Percentage\n" +
          `Delivered,${ordersStats.delivered},${Math.round(
            (ordersStats.delivered / ordersStats.totalOrders) * 100
          )}%\n` +
          `In Progress,${ordersStats.inProgress},${Math.round(
            (ordersStats.inProgress / ordersStats.totalOrders) * 100
          )}%\n` +
          `Cancelled,${ordersStats.cancelled},${Math.round(
            (ordersStats.cancelled / ordersStats.totalOrders) * 100
          )}%\n` +
          `Returned,${ordersStats.returned},${Math.round(
            (ordersStats.returned / ordersStats.totalOrders) * 100
          )}%\n`;
        fileName = "orders-report.csv";
        break;
      default:
        return;
    }

    const blob: Blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url: string = URL.createObjectURL(blob);
    const link: HTMLAnchorElement = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Custom report export
  const handleCustomExport = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/reports/custom?reportType=${reportType}&timeframe=${reportTimeframe}&format=${reportFormat}`
      );

      if (!response.ok) {
        throw new Error("Failed to generate custom report");
      }

      const result = await response.json();

      let csvData;
      let fileName;

      switch (reportType) {
        case "sales":
          interface DailySalesData {
            date: string;
            sales: number;
            orders: number;
          }

          interface SalesReportData {
            dailySales: DailySalesData[];
          }

          interface CustomReportResult {
            reportData: SalesReportData;
          }

          csvData =
            "Date,Sales,Orders\n" +
            (result as CustomReportResult).reportData.dailySales
              .map(
                (d: DailySalesData) =>
                  `${d.date},${d.sales.toFixed(2)},${d.orders}`
              )
              .join("\n");
          fileName = "custom-sales-report.csv";
          break;

        case "products":
          interface ProductReportData {
            name: string;
            category: string;
            quantitySold: number;
            revenue: number;
            cost: number;
            profit: number;
            margin: number;
          }

          interface ProductsReportData {
            products: ProductReportData[];
          }

          interface ProductCustomReportResult {
            reportData: ProductsReportData;
          }

          csvData =
            "Product,Category,Quantity Sold,Revenue,Cost,Profit,Margin\n" +
            (result as ProductCustomReportResult).reportData.products
              .map(
                (p: ProductReportData) =>
                  `"${p.name}","${p.category}",${
                    p.quantitySold
                  },${p.revenue.toFixed(2)},${p.cost.toFixed(
                    2
                  )},${p.profit.toFixed(2)},${p.margin}`
              )
              .join("\n");
          fileName = "custom-products-report.csv";
          break;

        case "customers":
          interface CustomerReportData {
            id: number;
            name: string;
            email: string;
            orderCount: number;
            totalSpent: number;
            averageOrderValue: number;
          }

          interface CustomersReportData {
            customers: CustomerReportData[];
          }

          interface CustomerCustomReportResult {
            reportData: CustomersReportData;
          }

          csvData =
            "Customer ID,Name,Email,Orders,Total Spent,Avg Order Value\n" +
            (result as CustomerCustomReportResult).reportData.customers
              .map(
                (c: CustomerReportData) =>
                  `${c.id},"${c.name}",${c.email},${
                    c.orderCount
                  },${c.totalSpent.toFixed(2)},${c.averageOrderValue}`
              )
              .join("\n");
          fileName = "custom-customers-report.csv";
          break;

        case "orders":
          interface DailyOrderData {
            date: string;
            count: number;
            revenue: number;
          }

          interface OrdersReportData {
            dailyOrders: DailyOrderData[];
          }

          interface OrderCustomReportResult {
            reportData: OrdersReportData;
          }

          csvData =
            "Date,Orders,Revenue\n" +
            (result as OrderCustomReportResult).reportData.dailyOrders
              .map(
                (d: DailyOrderData) =>
                  `${d.date},${d.count},${d.revenue.toFixed(2)}`
              )
              .join("\n");
          fileName = "custom-orders-report.csv";
          break;

        default:
          csvData = "No data available";
          fileName = "custom-report.csv";
          break;
      }

      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Custom report generated successfully");
    } catch (error) {
      console.error("Error generating custom report:", error);
      toast.error("Failed to generate custom report");
    } finally {
      setIsLoading(false);
    }
  };

  const renderProductProfitabilityTable = () => {
    if (isLoading) {
      return (
        <div className="h-40 flex items-center justify-center">
          <p>Loading profitability data...</p>
        </div>
      );
    }

    if (!profitabilityData || profitabilityData.length === 0) {
      return (
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3">Cost</th>
              <th className="px-6 py-3">Price</th>
              <th className="px-6 py-3">Margin</th>
              <th className="px-6 py-3">Margin %</th>
              <th className="px-6 py-3">Total Profit</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white border-b">
              <td colSpan={6} className="px-6 py-4 text-center">
                No profitability data available
              </td>
            </tr>
          </tbody>
        </table>
      );
    }

    return (
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3">Cost</th>
              <th className="px-6 py-3">Price</th>
              <th className="px-6 py-3">Margin</th>
              <th className="px-6 py-3">Margin %</th>
              <th className="px-6 py-3">Total Profit</th>
            </tr>
          </thead>
          <tbody>
            {" "}
            {profitabilityData.map((product) => (
              <tr key={product.id} className="bg-white border-b">
                <td className="px-6 py-4">{product.name}</td>
                <td className="px-6 py-4">€{product.cost}</td>
                <td className="px-6 py-4">€{product.price}</td>
                <td className="px-6 py-4">€{product.margin}</td>
                <td className="px-6 py-4">{product.marginPercentage}%</td>
                <td className="px-6 py-4">€{product.totalProfit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const getColorByIndex = (index: number): string => {
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
  };

  const renderCustomerCategories = () => {
    if (isLoading) {
      return (
        <div className="h-80 flex items-center justify-center">
          <p>Loading data...</p>
        </div>
      );
    }

    if (!customerCategoryData || customerCategoryData.length === 0) {
      return <EmptyState message="No customer category data available" />;
    }

    return (
      <>
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Visualize your customers&apos; preferred product categories to
            better target your offers.
          </p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={customerCategoryData.map((cat, index) => ({
                name: cat.name,
                value: cat.percentage,
                color: getColorByIndex(index),
              }))}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {customerCategoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColorByIndex(index)} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${value}%`, "Percentage of purchases"]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium mb-2">
              Top category by customer segment
            </h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span>New customers</span>
                <span className="font-medium">
                  {customerSegments.newCustomers}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Loyal customers</span>
                <span className="font-medium">
                  {customerSegments.returningCustomers}
                </span>
              </li>
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium mb-2">
              Average cart by category
            </h3>
            <ul className="space-y-2">
              {customerCategoryData.slice(0, 3).map((category, index) => (
                <li key={index} className="flex justify-between">
                  <span>{category.name}</span>
                  <span className="font-medium">${category.avgOrderValue}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </>
    );
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 p-4 rounded-md border border-red-200 mb-6">
          <h2 className="text-red-800 font-medium">Error loading data</h2>
          <p className="text-red-700">{error}</p>
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => window.location.reload()}
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics & Reports</h1>
        <div className="flex gap-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          {timeframe === "custom" && (
            <div className="flex gap-2">
              <div>
                <Input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => handleDateChange("from", e.target.value)}
                  className="w-36"
                />
              </div>
              <div>
                <Input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => handleDateChange("to", e.target.value)}
                  className="w-36"
                />
              </div>
            </div>
          )}

          <Button
            variant="outline"
            onClick={() => setCompareMode(!compareMode)}
          >
            {compareMode ? "Disable Comparison" : "Compare Periods"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Sales Trend</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleExportCSV("sales")}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-80 flex items-center justify-center">
                    <p>Loading data...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="sales"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                      <Line type="monotone" dataKey="profit" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-80 flex items-center justify-center">
                    <p>Loading data...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({
                          cx,
                          cy,
                          midAngle,
                          innerRadius,
                          outerRadius,
                          percent,
                          name,
                        }) => {
                          const radius =
                            innerRadius + (outerRadius - innerRadius) * 0.5;
                          const x =
                            cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                          const y =
                            cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                          return (
                            <text
                              x={x}
                              y={y}
                              fill="#fff"
                              textAnchor={x > cx ? "start" : "end"}
                              dominantBaseline="central"
                            >
                              {`${name} ${(percent * 100).toFixed(0)}%`}
                            </text>
                          );
                        }}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {compareMode && (
            <Card>
              <CardHeader>
                <CardTitle>Period Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <p className="text-sm font-medium">
                    Comparing current period with previous period
                  </p>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    +12.5%
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sales" name="Current Period" fill="#8884d8" />
                    <Bar
                      dataKey="profit"
                      name="Previous Period"
                      fill="#82ca9d"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Product Category Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-700">
                    Most profitable category
                  </p>
                  <p className="text-2xl font-bold">
                    {categoryPerformance.mostProfitableCategory?.name ||
                      "Loading..."}
                  </p>
                  <p className="text-sm text-blue-600">
                    Average margin:{" "}
                    {categoryPerformance.mostProfitableCategory?.avgMargin || 0}
                    %
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="font-medium text-green-700">Growing category</p>
                  <p className="text-2xl font-bold">
                    {categoryPerformance.fastestGrowingCategory?.name ||
                      "Loading..."}
                  </p>
                  <p className="text-sm text-green-600">
                    +
                    {categoryPerformance.fastestGrowingCategory?.totalSales ||
                      0}{" "}
                    this month
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="font-medium text-purple-700">
                    Most reviewed category
                  </p>
                  <p className="text-2xl font-bold">
                    {categoryPerformance.mostReviewedCategory?.name ||
                      "Loading..."}
                  </p>
                  <p className="text-sm text-purple-600">
                    Average rating:{" "}
                    {categoryPerformance.mostReviewedCategory?.avgRating || 0}/5
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-sm mb-3">
                    Stock by category
                  </h3>
                  <table className="w-full text-sm">
                    <tbody>
                      {categoryPerformance.categoryPerformance
                        ?.slice(0, 4)
                        .map((category, idx) => (
                          <tr key={idx} className={idx < 3 ? "border-b" : ""}>
                            <td className="py-2">{category?.name}</td>
                            <td className="py-2 font-medium text-right">
                              {category?.totalStock} units
                            </td>
                          </tr>
                        )) || (
                        <tr>
                          <td className="py-2" colSpan={2}>
                            Loading data...
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-sm mb-3">
                    Popular product-brand relationships
                  </h3>
                  <table className="w-full text-sm">
                    <tbody>
                      {categoryPerformance.popularBrandCategoryRelations
                        ?.slice(0, 4)
                        .map((relation, idx) => (
                          <tr key={idx} className={idx < 3 ? "border-b" : ""}>
                            <td className="py-2">{relation?.brandName}</td>
                            <td className="py-2 text-gray-600">
                              {relation?.categoryName}
                            </td>
                            <td className="py-2 font-medium text-right">
                              {relation?.percentage}%
                            </td>
                          </tr>
                        )) || (
                        <tr>
                          <td className="py-2" colSpan={3}>
                            Loading data...
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Best Selling Products</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleExportCSV("products")}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {productData.slice(0, 5).map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-500">
                          #{index + 1}
                        </span>
                        <span>{product.name}</span>
                      </div>
                      <div className="flex gap-6">
                        <span className="text-gray-500">
                          {product.sales} units
                        </span>
                        <span className="font-medium">${product.revenue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={productData.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="stock" fill="#82ca9d" name="Current Stock" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Product Profitability</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleExportCSV("profitability")}
              >
                <Download className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>{renderProductProfitabilityTable()}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6"></div>

          <Card>
            <CardHeader>
              <CardTitle>Customer Purchase Categories</CardTitle>
            </CardHeader>
            <CardContent>{renderCustomerCategories()}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{ordersStats.totalOrders}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">
                  {ordersStats.delivered}{" "}
                  <span className="text-sm text-gray-500">
                    (
                    {Math.round(
                      (ordersStats.delivered / ordersStats.totalOrders) * 100
                    )}
                    %)
                  </span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  In Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-yellow-600">
                  {ordersStats.inProgress}{" "}
                  <span className="text-sm text-gray-500">
                    (
                    {Math.round(
                      (ordersStats.inProgress / ordersStats.totalOrders) * 100
                    )}
                    %)
                  </span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Cancelled/Returned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">
                  {ordersStats.cancelled + ordersStats.returned}{" "}
                  <span className="text-sm text-gray-500">
                    (
                    {Math.round(
                      ((ordersStats.cancelled + ordersStats.returned) /
                        ordersStats.totalOrders) *
                        100
                    )}
                    %)
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Order Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: "Delivered",
                        value: ordersStats.delivered,
                        color: "#4BC0C0",
                      },
                      {
                        name: "In Progress",
                        value: ordersStats.inProgress,
                        color: "#FFCE56",
                      },
                      {
                        name: "Cancelled",
                        value: ordersStats.cancelled,
                        color: "#FF6384",
                      },
                      {
                        name: "Returned",
                        value: ordersStats.returned,
                        color: "#9966FF",
                      },
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {sampleCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Custom Report Builder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger id="report-type">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales Report</SelectItem>
                  <SelectItem value="products">Product Report</SelectItem>
                  <SelectItem value="customers">Customer Analysis</SelectItem>
                  <SelectItem value="orders">Order Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="report-period">Time Period</Label>
              <Select
                value={reportTimeframe}
                onValueChange={setReportTimeframe}
              >
                <SelectTrigger id="report-period">
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="last7days">Last 7 Days</SelectItem>
                  <SelectItem value="last30days">Last 30 Days</SelectItem>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                  <SelectItem value="lastMonth">Last Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="report-format">Export Format</Label>
              <Select value={reportFormat} onValueChange={setReportFormat}>
                <SelectTrigger id="report-format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox id="scheduled" />
              <Label htmlFor="scheduled" className="text-sm font-medium">
                Schedule regular delivery of this report
              </Label>
            </div>
            <Button
              onClick={handleCustomExport}
              className="bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? "Generating..." : "Generate Custom Report"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
