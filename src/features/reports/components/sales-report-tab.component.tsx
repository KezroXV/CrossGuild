"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import CategoryPerformanceSection from "@/features/reports/components/category-performance-section.component";
import CategoryPieChart from "@/features/reports/components/category-pie-chart.component";
import ExportButton from "@/features/reports/components/export-button.component";
import ReportLoading from "@/features/reports/components/report-loading.component";
import { ReportBarChart, ReportLineChart } from "@/features/reports/components/report-chart.component";
import type {
  CategoryDataPoint,
  CategoryPerformanceData,
  SalesComparison,
  SalesDataPoint,
} from "@/features/reports/types/report.type";

type SalesReportTabProps = {
  isLoading: boolean;
  compareMode: boolean;
  salesData: SalesDataPoint[];
  categoryData: CategoryDataPoint[];
  categoryPerformance: CategoryPerformanceData;
  salesComparison: SalesComparison | null;
  onExport: () => void;
};

export default function SalesReportTab({
  isLoading,
  compareMode,
  salesData,
  categoryData,
  categoryPerformance,
  salesComparison,
  onExport,
}: SalesReportTabProps) {
  const percentChange = salesComparison?.percentChange ?? 0;
  const isPositive = percentChange >= 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Sales Trend</CardTitle>
            <ExportButton onExport={onExport} label="Export sales" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ReportLoading />
            ) : (
              <ReportLineChart
                data={salesData}
                lines={[
                  { dataKey: "sales", stroke: "#8884d8" },
                  { dataKey: "profit", stroke: "#82ca9d" },
                ]}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ReportLoading />
            ) : (
              <CategoryPieChart data={categoryData} />
            )}
          </CardContent>
        </Card>
      </div>

      {compareMode && salesComparison && (
        <Card>
          <CardHeader>
            <CardTitle>Period Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <p className="text-sm font-medium">
                Comparing current period with previous period
              </p>
              <span
                className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                  isPositive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {isPositive ? "+" : ""}
                {percentChange.toFixed(1)}%
              </span>
            </div>
            <ReportBarChart
              data={[
                {
                  name: "Sales",
                  current: salesComparison.currentTotal,
                  previous: salesComparison.previousTotal,
                },
              ]}
              bars={[
                { dataKey: "current", fill: "#8884d8", name: "Current Period" },
                { dataKey: "previous", fill: "#82ca9d", name: "Previous Period" },
              ]}
            />
          </CardContent>
        </Card>
      )}

      <CategoryPerformanceSection
        categoryPerformance={categoryPerformance}
        isLoading={isLoading}
      />
    </div>
  );
}
