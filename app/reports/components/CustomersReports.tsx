import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
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
import { sampleCustomerData, sampleCategoryData } from "./data/mockData";
import { Skeleton } from "./ui/Skeleton";

interface CustomerMetrics {
  avgOrderValue: number;
  customerLifetimeValue: number;
  repeatCustomerPercentage: number;
  newVsReturningRatio: string;
  percentChange: number;
}

interface CustomersReportsProps {
  isLoading: boolean;
  customerMetrics: CustomerMetrics;
}

export default function CustomersReports({
  isLoading,
  customerMetrics,
}: CustomersReportsProps) {
  const [customerData] = useState(sampleCustomerData);

  // Customer metrics card skeleton
  const MetricsCardSkeleton = () => (
    <div className="grid grid-cols-2 gap-4 mb-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="p-4 rounded-lg bg-muted/20">
          <Skeleton className="h-3 w-28 mb-2" />
          <Skeleton className="h-6 w-20 mb-1" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );

  // Demographics chart skeleton
  const DemographicsChartSkeleton = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-36" />
      </div>
      <div className="h-[300px] flex flex-col justify-between px-12">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 w-full">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-full" />
          </div>
        ))}
      </div>
    </div>
  );

  // Pie chart skeleton
  const PieChartSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-[200px] w-[200px] rounded-full mx-auto" />
      <div className="flex justify-center gap-4 mt-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-1">
            <Skeleton className="h-3 w-3" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Demographics */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Demographics</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <DemographicsChartSkeleton />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={customerData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="country" type="category" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="customers" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Customer Value Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Value Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <MetricsCardSkeleton />
            ) : (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-700">Avg. Order Value</p>
                  <p className="text-2xl font-bold">
                    ${customerMetrics.avgOrderValue.toFixed(2)}
                  </p>
                  <p className="text-sm text-blue-600">
                    {customerMetrics.percentChange > 0
                      ? `+${customerMetrics.percentChange.toFixed(1)}%`
                      : `${customerMetrics.percentChange.toFixed(1)}%`}{" "}
                    vs last period
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="font-medium text-green-700">
                    Customer Lifetime Value
                  </p>
                  <p className="text-2xl font-bold">
                    ${customerMetrics.customerLifetimeValue.toFixed(2)}
                  </p>
                  <p className="text-sm text-green-600">
                    Based on repeat purchases
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="font-medium text-yellow-700">
                    Repeat Customers
                  </p>
                  <p className="text-2xl font-bold">
                    {customerMetrics.repeatCustomerPercentage.toFixed(0)}%
                  </p>
                  <p className="text-sm text-yellow-600">
                    Of total customer base
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="font-medium text-purple-700">
                    New vs Returning
                  </p>
                  <p className="text-2xl font-bold">
                    {customerMetrics.newVsReturningRatio}
                  </p>
                  <p className="text-sm text-purple-600">Customer ratio</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Acquisition Channels */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Acquisition Channels</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <PieChartSkeleton />
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
