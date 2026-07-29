"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import ExportButton from "@/features/reports/components/export-button.component";
import { ReportBarChart } from "@/features/reports/components/report-chart.component";
import type {
  ProductDataPoint,
  ProfitabilityData,
} from "@/features/reports/types/report.type";

type ProductsReportTabProps = {
  isLoading: boolean;
  productData: ProductDataPoint[];
  profitabilityData: ProfitabilityData[];
  onExportProducts: () => void;
  onExportProfitability: () => void;
};

export default function ProductsReportTab({
  isLoading,
  productData,
  profitabilityData,
  onExportProducts,
  onExportProfitability,
}: ProductsReportTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Best Selling Products</CardTitle>
            <ExportButton onExport={onExportProducts} label="Export products" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productData.slice(0, 5).map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-500">#{index + 1}</span>
                    <span>{product.name}</span>
                  </div>
                  <div className="flex gap-6">
                    <span className="text-gray-500">{product.sales} units</span>
                    <span className="font-medium">${product.revenue}</span>
                  </div>
                </div>
              ))}
              {!isLoading && productData.length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  No product data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Status</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingPlaceholder height={200} />
            ) : (
              <ReportBarChart
                data={productData.slice(0, 5)}
                height={200}
                tickFontSize={12}
                bars={[
                  { dataKey: "stock", fill: "#82ca9d", name: "Current Stock" },
                ]}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Product Profitability</CardTitle>
          <ExportButton
            onExport={onExportProfitability}
            label="Export profitability"
          />
        </CardHeader>
        <CardContent>
          <ProfitabilityTable
            isLoading={isLoading}
            data={profitabilityData}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function ProfitabilityTable({
  isLoading,
  data,
}: {
  isLoading: boolean;
  data: ProfitabilityData[];
}) {
  if (isLoading) {
    return (
      <div className="h-40 flex items-center justify-center">
        <p>Loading profitability data...</p>
      </div>
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
          {data.length === 0 ? (
            <tr className="bg-white border-b">
              <td colSpan={6} className="px-6 py-4 text-center">
                No profitability data available
              </td>
            </tr>
          ) : (
            data.map((product) => (
              <tr key={product.id} className="bg-white border-b">
                <td className="px-6 py-4">{product.name}</td>
                <td className="px-6 py-4">€{product.cost}</td>
                <td className="px-6 py-4">€{product.price}</td>
                <td className="px-6 py-4">€{product.margin}</td>
                <td className="px-6 py-4">{product.marginPercentage}%</td>
                <td className="px-6 py-4">€{product.totalProfit}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function LoadingPlaceholder({ height = 300 }: { height?: number }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{ height }}
    >
      <p>Loading data...</p>
    </div>
  );
}
