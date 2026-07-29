"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import ReportEmptyState from "@/features/reports/components/report-empty-state.component";
import {
  getColorByIndex,
  ReportPieChart,
} from "@/features/reports/components/report-chart.component";
import type {
  CustomerCategoryData,
  CustomerSegments,
} from "@/features/reports/types/report.type";

type CustomersReportTabProps = {
  isLoading: boolean;
  customerCategoryData: CustomerCategoryData[];
  customerSegments: CustomerSegments;
};

export default function CustomersReportTab({
  isLoading,
  customerCategoryData,
  customerSegments,
}: CustomersReportTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer Purchase Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-80 flex items-center justify-center">
              <p>Loading data...</p>
            </div>
          ) : !customerCategoryData.length ? (
            <ReportEmptyState message="No customer category data available" />
          ) : (
            <>
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Visualize your customers&apos; preferred product categories to
                  better target your offers.
                </p>
              </div>
              <ReportPieChart
                data={customerCategoryData.map((cat, index) => ({
                  name: cat.name,
                  value: cat.percentage,
                  color: getColorByIndex(index),
                }))}
                outerRadius={100}
                tooltipFormatter={(value) => [
                  `${value}%`,
                  "Percentage of purchases",
                ]}
              />
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
                        <span className="font-medium">
                          ${category.avgOrderValue}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
