"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ReportPieChart } from "@/features/reports/components/report-chart.component";
import type { OrdersStats } from "@/features/reports/types/report.type";

type OrdersReportTabProps = {
  ordersStats: OrdersStats;
};

export default function OrdersReportTab({ ordersStats }: OrdersReportTabProps) {
  const total = ordersStats.totalOrders || 1;
  const pct = (value: number) => Math.round((value / total) * 100);

  const pieData = [
    { name: "Delivered", value: ordersStats.delivered, color: "#4BC0C0" },
    { name: "In Progress", value: ordersStats.inProgress, color: "#FFCE56" },
    { name: "Cancelled", value: ordersStats.cancelled, color: "#FF6384" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Orders" value={String(ordersStats.totalOrders)} />
        <StatCard
          title="Delivered"
          value={`${ordersStats.delivered}`}
          suffix={`(${pct(ordersStats.delivered)}%)`}
          className="text-green-600"
        />
        <StatCard
          title="In Progress"
          value={`${ordersStats.inProgress}`}
          suffix={`(${pct(ordersStats.inProgress)}%)`}
          className="text-yellow-600"
        />
        <StatCard
          title="Cancelled"
          value={`${ordersStats.cancelled}`}
          suffix={`(${pct(ordersStats.cancelled)}%)`}
          className="text-red-600"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportPieChart data={pieData} outerRadius={100} />
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  suffix,
  className,
}: {
  title: string;
  value: string;
  suffix?: string;
  className?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-bold ${className ?? ""}`}>
          {value}{" "}
          {suffix && (
            <span className="text-sm text-gray-500 font-normal">{suffix}</span>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
