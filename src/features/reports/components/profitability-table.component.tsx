"use client";

import ReportLoading from "@/features/reports/components/report-loading.component";
import type { ProfitabilityData } from "@/features/reports/types/report.type";

type ProfitabilityTableProps = {
  isLoading: boolean;
  data: ProfitabilityData[];
};

export default function ProfitabilityTable({
  isLoading,
  data,
}: ProfitabilityTableProps) {
  if (isLoading) {
    return (
      <ReportLoading height={160} message="Loading profitability data..." />
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
