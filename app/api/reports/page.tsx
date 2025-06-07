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
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Download } from "lucide-react";

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
import { sampleSalesData } from "@/app/reports/components/data/mockData";

const sampleCategoryData = [
  { name: "Gaming", value: 400, color: "#FF6384" },
  { name: "Accessories", value: 300, color: "#36A2EB" },
  { name: "Computers", value: 300, color: "#FFCE56" },
  { name: "Components", value: 200, color: "#4BC0C0" },
  { name: "Peripherals", value: 100, color: "#9966FF" },
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

const sampleProductData = [
  { name: "Gaming Mouse X1", sales: 120, revenue: 3600, stock: 25 },
  { name: "Mechanical Keyboard Pro", sales: 95, revenue: 9500, stock: 12 },
  { name: "Ultra HD Monitor", sales: 80, revenue: 12000, stock: 8 },
  { name: "Gaming Headset", sales: 150, revenue: 7500, stock: 35 },
  { name: "Graphics Card RTX", sales: 45, revenue: 22500, stock: 3 },
];

export default function ReportsPage() {
  const [timeframe, setTimeframe] = useState("month");
  const [compareMode, setCompareMode] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  });

  const [isLoading, setIsLoading] = useState(false);
  const [salesData] = useState(sampleSalesData);
  const [productData] = useState(sampleProductData);
  const [categoryData] = useState(sampleCategoryData);

  // Fetch data based on selected timeframe
  useEffect(() => {
    const fetchReportData = async () => {
      setIsLoading(true);
      try {
        // In production, you would fetch real data from your API
        // const response = await fetch(`/api/reports/sales?timeframe=${timeframe}`);
        // const data = await response.json();
        // setSalesData(data.salesData);
        // setCategoryData(data.categoryData);

        // For this example, we're just simulating a load
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Keep using the sample data for now
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching report data:", error);
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, [timeframe, dateRange]);  // Export reports as CSV
  const handleExportCSV = (reportType: string) => {
    let csvData;
    let fileName;

    switch (reportType) {
      case "sales":
        csvData =
          "Period,Sales,Profit\n" +
          salesData.map((d) => `${d.name},${d.sales},${d.profit}`).join("\n");
        fileName = "sales-report.csv";
        break;
      case "products":
        csvData =
          "Product,Sales,Revenue,Stock\n" +
          productData
            .map((d) => `${d.name},${d.sales},${d.revenue},${d.stock}`)
            .join("\n");
        fileName = "products-report.csv";
        break;
      default:
        return;
    }

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          </Select>          {timeframe === "custom" && (
            <div className="flex gap-2">              <div>
                <Input
                  type="date"
                  value={dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const newDate = e.target.value ? new Date(e.target.value) : undefined;
                    if (newDate) {
                      setDateRange(prev => ({ ...prev, from: newDate }));
                    }
                  }}
                  className="w-36"
                />
              </div>
              <div>
                <Input
                  type="date"
                  value={dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const newDate = e.target.value ? new Date(e.target.value) : undefined;
                    if (newDate) {
                      setDateRange(prev => ({ ...prev, to: newDate }));
                    }
                  }}
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
        </TabsList>

        {/* Sales Reports Tab */}
        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sales Overview Card */}
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

            {/* Category Distribution Card */}
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

          {/* Period Comparison Section */}
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

          {/* Seasonal Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Seasonal Trends & Forecasting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-700">Peak Day</p>
                  <p className="text-2xl font-bold">Saturday</p>
                  <p className="text-sm text-blue-600">+35% vs. average day</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="font-medium text-green-700">Best Month</p>
                  <p className="text-2xl font-bold">December</p>
                  <p className="text-sm text-green-600">
                    +85% vs. average month
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="font-medium text-purple-700">
                    Projected Growth
                  </p>
                  <p className="text-2xl font-bold">+18%</p>
                  <p className="text-sm text-purple-600">
                    Next quarter forecast
                  </p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
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
                    strokeDasharray="5 5"
                  />
                  {/* Forecasted data would extend this line */}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Reports Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Best Sellers Card */}
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
                        <span className="font-medium">€{product.revenue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Inventory Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Healthy Stock</p>
                    <p className="text-xl font-bold">85 products</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Low Stock</p>
                    <p className="text-xl font-bold">12 products</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Out of Stock</p>
                    <p className="text-xl font-bold">5 products</p>
                  </div>
                </div>
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

          {/* Products Profitability */}
          <Card>
            <CardHeader>
              <CardTitle>Product Profitability</CardTitle>
            </CardHeader>
            <CardContent>
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
                    <tr className="bg-white border-b">
                      <td className="px-6 py-4">Gaming Mouse X1</td>
                      <td className="px-6 py-4">€15</td>
                      <td className="px-6 py-4">€30</td>
                      <td className="px-6 py-4">€15</td>
                      <td className="px-6 py-4">50%</td>
                      <td className="px-6 py-4">€1,800</td>
                    </tr>
                    <tr className="bg-white border-b">
                      <td className="px-6 py-4">Mechanical Keyboard Pro</td>
                      <td className="px-6 py-4">€45</td>
                      <td className="px-6 py-4">€100</td>
                      <td className="px-6 py-4">€55</td>
                      <td className="px-6 py-4">55%</td>
                      <td className="px-6 py-4">€5,225</td>
                    </tr>
                    <tr className="bg-white border-b">
                      <td className="px-6 py-4">Ultra HD Monitor</td>
                      <td className="px-6 py-4">€95</td>
                      <td className="px-6 py-4">€150</td>
                      <td className="px-6 py-4">€55</td>
                      <td className="px-6 py-4">36.7%</td>
                      <td className="px-6 py-4">€4,400</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Demographics */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sampleCustomerData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="country" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="customers" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Customer Value Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Value Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {" "}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-700">
                      Avg. Order Value
                    </p>
                    <p className="text-2xl font-bold">€85.45</p>
                    <p className="text-sm text-blue-600">+12% vs last period</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-700">
                      Customer Lifetime Value
                    </p>
                    <p className="text-2xl font-bold">€485.20</p>
                    <p className="text-sm text-green-600">
                      Based on repeat purchases
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="font-medium text-yellow-700">
                      Repeat Customers
                    </p>
                    <p className="text-2xl font-bold">32%</p>
                    <p className="text-sm text-yellow-600">
                      Of total customer base
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="font-medium text-purple-700">
                      New vs Returning
                    </p>
                    <p className="text-2xl font-bold">68% / 32%</p>
                    <p className="text-sm text-purple-600">Customer ratio</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Acquisition Channels */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Acquisition Channels</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Organic Search", value: 40, color: "#4BC0C0" },
                      { name: "Social Media", value: 25, color: "#FFCE56" },
                      { name: "Direct", value: 20, color: "#36A2EB" },
                      { name: "Referral", value: 10, color: "#FF6384" },
                      { name: "Paid Search", value: 5, color: "#9966FF" },
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

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Order Statistics Cards */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {sampleOrdersStats.totalOrders}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">
                  {sampleOrdersStats.delivered}{" "}
                  <span className="text-sm text-gray-500">
                    (
                    {Math.round(
                      (sampleOrdersStats.delivered /
                        sampleOrdersStats.totalOrders) *
                        100
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
                  {sampleOrdersStats.inProgress}{" "}
                  <span className="text-sm text-gray-500">
                    (
                    {Math.round(
                      (sampleOrdersStats.inProgress /
                        sampleOrdersStats.totalOrders) *
                        100
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
                  {sampleOrdersStats.cancelled + sampleOrdersStats.returned}{" "}
                  <span className="text-sm text-gray-500">
                    (
                    {Math.round(
                      ((sampleOrdersStats.cancelled +
                        sampleOrdersStats.returned) /
                        sampleOrdersStats.totalOrders) *
                        100
                    )}
                    %)
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Order Status Chart */}
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
                        value: sampleOrdersStats.delivered,
                        color: "#4BC0C0",
                      },
                      {
                        name: "In Progress",
                        value: sampleOrdersStats.inProgress,
                        color: "#FFCE56",
                      },
                      {
                        name: "Cancelled",
                        value: sampleOrdersStats.cancelled,
                        color: "#FF6384",
                      },
                      {
                        name: "Returned",
                        value: sampleOrdersStats.returned,
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

          {/* Delivery Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-700">
                    Avg. Processing Time
                  </p>
                  <p className="text-2xl font-bold">1.2 days</p>
                  <p className="text-sm text-blue-600">Order to shipment</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="font-medium text-green-700">
                    Avg. Delivery Time
                  </p>
                  <p className="text-2xl font-bold">3.5 days</p>
                  <p className="text-sm text-green-600">Shipment to delivery</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="font-medium text-yellow-700">
                    On-Time Delivery
                  </p>
                  <p className="text-2xl font-bold">94.5%</p>
                  <p className="text-sm text-yellow-600">
                    Within promised time
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Marketing Tab */}
        <TabsContent value="marketing" className="space-y-6">
          {/* Promo Codes Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Promotional Codes Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-3">Promo Code</th>
                      <th className="px-6 py-3">Discount</th>
                      <th className="px-6 py-3">Uses</th>
                      <th className="px-6 py-3">Revenue</th>
                      <th className="px-6 py-3">Avg. Order</th>
                      <th className="px-6 py-3">Conversion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {" "}
                    <tr className="bg-white border-b">
                      <td className="px-6 py-4">SUMMER25</td>
                      <td className="px-6 py-4">25%</td>
                      <td className="px-6 py-4">245</td>
                      <td className="px-6 py-4">€15,625</td>
                      <td className="px-6 py-4">€63.78</td>
                      <td className="px-6 py-4">8.5%</td>
                    </tr>
                    <tr className="bg-white border-b">
                      <td className="px-6 py-4">WELCOME10</td>
                      <td className="px-6 py-4">10%</td>
                      <td className="px-6 py-4">356</td>
                      <td className="px-6 py-4">€20,420</td>
                      <td className="px-6 py-4">€57.36</td>
                      <td className="px-6 py-4">12.4%</td>
                    </tr>
                    <tr className="bg-white border-b">
                      <td className="px-6 py-4">FLASH50</td>
                      <td className="px-6 py-4">50%</td>
                      <td className="px-6 py-4">124</td>
                      <td className="px-6 py-4">€8,750</td>
                      <td className="px-6 py-4">€70.56</td>
                      <td className="px-6 py-4">18.9%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Campaign Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Marketing Campaign Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {" "}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-700">Black Friday</p>
                  <p className="text-2xl font-bold">€58,240</p>
                  <p className="text-sm text-blue-600">ROI: 425%</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="font-medium text-purple-700">Summer Sale</p>
                  <p className="text-2xl font-bold">€32,180</p>
                  <p className="text-sm text-purple-600">ROI: 280%</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="font-medium text-green-700">New Year</p>
                  <p className="text-2xl font-bold">€24,650</p>
                  <p className="text-sm text-green-600">ROI: 195%</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={[
                    { name: "Black Friday", cost: 11000, revenue: 58240 },
                    { name: "Summer Sale", cost: 8500, revenue: 32180 },
                    { name: "New Year", cost: 8300, revenue: 24650 },
                    { name: "Spring Clearance", cost: 5200, revenue: 14500 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="#82ca9d" />
                  <Bar dataKey="cost" name="Cost" fill="#ff7675" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* User Behavior */}
          <Card>
            <CardHeader>
              <CardTitle>User Behavior</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="font-medium text-orange-700">
                    Cart Abandonment
                  </p>
                  <p className="text-2xl font-bold">68.2%</p>
                  <p className="text-sm text-orange-600">
                    -2.5% from last month
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-700">Avg. Session Time</p>
                  <p className="text-2xl font-bold">3m 45s</p>
                  <p className="text-sm text-blue-600">+15s from last month</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="font-medium text-purple-700">
                    Page Views/Session
                  </p>
                  <p className="text-2xl font-bold">4.8</p>
                  <p className="text-sm text-purple-600">
                    +0.3 from last month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
