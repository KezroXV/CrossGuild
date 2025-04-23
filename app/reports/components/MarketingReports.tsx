import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "./ui/Skeleton";

interface MarketingReportsProps {
  isLoading: boolean;
}

export default function MarketingReports({ isLoading }: MarketingReportsProps) {
  // Table skeleton
  const TableSkeleton = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-6 gap-4 bg-muted/10 p-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-3 w-full" />
        ))}
      </div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="grid grid-cols-6 gap-4 border-b p-3">
          {[...Array(6)].map((_, j) => (
            <Skeleton key={j} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  );

  // Stats box skeleton
  const StatsBoxSkeleton = () => (
    <div className="p-4 rounded-lg bg-muted/20">
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-6 w-20 mb-1" />
      <Skeleton className="h-3 w-24" />
    </div>
  );

  // Chart skeleton
  const ChartSkeleton = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-[60px]" />
      </div>
      <Skeleton className="h-[250px] w-full" />
      <div className="flex justify-center gap-8">
        <Skeleton className="h-4 w-[80px]" />
        <Skeleton className="h-4 w-[80px]" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Promo Codes Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Promotional Codes Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : (
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
                  <tr className="bg-white border-b">
                    <td className="px-6 py-4">SUMMER25</td>
                    <td className="px-6 py-4">25%</td>
                    <td className="px-6 py-4">245</td>
                    <td className="px-6 py-4">$15,625</td>
                    <td className="px-6 py-4">$63.78</td>
                    <td className="px-6 py-4">8.5%</td>
                  </tr>
                  <tr className="bg-white border-b">
                    <td className="px-6 py-4">WELCOME10</td>
                    <td className="px-6 py-4">10%</td>
                    <td className="px-6 py-4">356</td>
                    <td className="px-6 py-4">$20,420</td>
                    <td className="px-6 py-4">$57.36</td>
                    <td className="px-6 py-4">12.4%</td>
                  </tr>
                  <tr className="bg-white border-b">
                    <td className="px-6 py-4">FLASH50</td>
                    <td className="px-6 py-4">50%</td>
                    <td className="px-6 py-4">124</td>
                    <td className="px-6 py-4">$8,750</td>
                    <td className="px-6 py-4">$70.56</td>
                    <td className="px-6 py-4">18.9%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campaign Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Marketing Campaign Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsBoxSkeleton />
                <StatsBoxSkeleton />
                <StatsBoxSkeleton />
              </div>
              <Skeleton className="h-[250px] w-full" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-700">Black Friday</p>
                  <p className="text-2xl font-bold">$58,240</p>
                  <p className="text-sm text-blue-600">ROI: 425%</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="font-medium text-purple-700">Summer Sale</p>
                  <p className="text-2xl font-bold">$32,180</p>
                  <p className="text-sm text-purple-600">ROI: 280%</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="font-medium text-green-700">New Year</p>
                  <p className="text-2xl font-bold">$24,650</p>
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
            </>
          )}
        </CardContent>
      </Card>

      {/* User Behavior */}
      <Card>
        <CardHeader>
          <CardTitle>User Behavior</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsBoxSkeleton />
                <StatsBoxSkeleton />
                <StatsBoxSkeleton />
              </div>
              <ChartSkeleton />
            </div>
          ) : (
            <>
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

              {/* Add cart abandonment chart */}
              <ResponsiveContainer width="100%" height={250}>
                <LineChart
                  data={[
                    { month: "Jan", abandonment: 72.3 },
                    { month: "Feb", abandonment: 70.8 },
                    { month: "Mar", abandonment: 69.5 },
                    { month: "Apr", abandonment: 68.7 },
                    { month: "May", abandonment: 68.2 },
                    { month: "Jun", abandonment: 67.9 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[65, 75]} />
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Cart Abandonment"]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="abandonment"
                    stroke="#ff7675"
                    name="Cart Abandonment Rate (%)"
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
