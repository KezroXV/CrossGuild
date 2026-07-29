"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import ExportButton from "@/features/reports/components/export-button.component";
import {
  CategoryPieChart,
  ReportBarChart,
  ReportLineChart,
} from "@/features/reports/components/report-chart.component";
import CategoryPerformanceSection from "@/features/reports/components/category-performance-section.component";
import type {
  CategoryDataPoint,
  CategoryPerformanceData,
  SalesDataPoint,
} from "@/features/reports/types/report.type";

type SalesReportTabProps = {
  isLoading: boolean;
  compareMode: boolean;
  salesData: SalesDataPoint[];
  categoryData: CategoryDataPoint[];
  categoryPerformance: CategoryPerformanceData;
  onExport: () => void;
};

export default function SalesReportTab({
  isLoading,
  compareMode,
  salesData,
  categoryData,
  categoryPerformance,
  onExport,
}: SalesReportTabProps) {
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
              <LoadingPlaceholder />
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
              <LoadingPlaceholder />
            ) : (
              <CategoryPieChart data={categoryData} />
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
            <ReportBarChart
              data={salesData}
              bars={[
                { dataKey: "sales", fill: "#8884d8", name: "Current Period" },
                { dataKey: "profit", fill: "#82ca9d", name: "Previous Period" },
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

function LoadingPlaceholder() {
  return (
    <div className="h-80 flex items-center justify-center">
      <p>Loading data...</p>
    </div>
  );
}
