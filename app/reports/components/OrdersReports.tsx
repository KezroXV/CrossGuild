import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { sampleOrdersStats, sampleCategoryData } from "./data/mockData";
import { Skeleton } from "./ui/Skeleton";

interface OrdersReportsProps {
  isLoading: boolean;
}

export default function OrdersReports({ isLoading }: OrdersReportsProps) {
  const [ordersStats] = useState(sampleOrdersStats);

  // Order stat card skeleton
  const OrderStatCardSkeleton = () => (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16" />
      </CardContent>
    </Card>
  );

  // Stats box skeleton
  const StatsBoxSkeleton = () => (
    <div className="p-4 rounded-lg bg-muted/20">
      <Skeleton className="h-4 w-32 mb-2" />
      <Skeleton className="h-6 w-16 mb-1" />
      <Skeleton className="h-3 w-24" />
    </div>
  );

  // Pie chart skeleton
  const PieChartSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-[200px] w-[200px] rounded-full mx-auto" />
      <div className="flex justify-center gap-6 mt-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-1">
            <Skeleton className="h-3 w-3" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Order Statistics Cards */}
        {isLoading ? (
          <>
            <OrderStatCardSkeleton />
            <OrderStatCardSkeleton />
            <OrderStatCardSkeleton />
            <OrderStatCardSkeleton />
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* Order Status Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Order Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <PieChartSkeleton />
          ) : (
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
          )}
        </CardContent>
      </Card>

      {/* Delivery Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <StatsBoxSkeleton />
              <StatsBoxSkeleton />
              <StatsBoxSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-700">
                  Avg. Processing Time
                </p>
                <p className="text-2xl font-bold">1.2 days</p>
                <p className="text-sm text-blue-600">Order to shipment</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="font-medium text-green-700">Avg. Delivery Time</p>
                <p className="text-2xl font-bold">3.5 days</p>
                <p className="text-sm text-green-600">Shipment to delivery</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="font-medium text-yellow-700">On-Time Delivery</p>
                <p className="text-2xl font-bold">94.5%</p>
                <p className="text-sm text-yellow-600">Within promised time</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
