import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
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
  BarChart,
  Bar,
} from "recharts";
import { sampleSalesData, sampleCategoryData } from "./data/mockData";
import { Skeleton } from "./ui/Skeleton";

interface SalesReportsProps {
  isLoading: boolean;
  compareMode: boolean;
}

export default function SalesReports({
  isLoading,
  compareMode,
}: SalesReportsProps) {
  const [salesData] = useState(sampleSalesData);
  const [categoryData] = useState(sampleCategoryData);

  // Export reports as CSV
  const handleExportCSV = () => {
    const csvData =
      "Period,Sales,Profit\n" +
      salesData.map((d) => `${d.name},${d.sales},${d.profit}`).join("\n");
    const fileName = "sales-report.csv";

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sales chart skeleton
  const SalesChartSkeleton = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-[60px]" />
      </div>
      <Skeleton className="h-[300px] w-full" />
      <div className="flex justify-center gap-8">
        <Skeleton className="h-4 w-[80px]" />
        <Skeleton className="h-4 w-[80px]" />
      </div>
    </div>
  );

  // Pie chart skeleton
  const PieChartSkeleton = () => (
    <div className="space-y-2">
      <Skeleton className="h-[200px] w-[200px] rounded-full mx-auto" />
      <div className="flex justify-center gap-6 mt-4">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="flex items-center gap-1">
            <Skeleton className="h-3 w-3" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );

  // Stats box skeleton
  const StatsBoxSkeleton = () => (
    <div className="p-4 rounded-lg bg-muted/20">
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-6 w-16 mb-1" />
      <Skeleton className="h-3 w-20" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sales Overview Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Sales Trend</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleExportCSV}
              disabled={isLoading}
            >
              <Download className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <SalesChartSkeleton />
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
              <PieChartSkeleton />
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
            {isLoading ? (
              <SalesChartSkeleton />
            ) : (
              <>
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
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Seasonal Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Seasonal Trends & Forecasting</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsBoxSkeleton />
                <StatsBoxSkeleton />
                <StatsBoxSkeleton />
              </div>
              <Skeleton className="h-[200px] w-full" />
            </div>
          ) : (
            <>
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
                </LineChart>
              </ResponsiveContainer>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
