"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { CategoryPerformanceData } from "@/features/reports/types/report.type";

type CategoryPerformanceSectionProps = {
  categoryPerformance: CategoryPerformanceData;
  isLoading: boolean;
};

export default function CategoryPerformanceSection({
  categoryPerformance,
  isLoading,
}: CategoryPerformanceSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Category Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="font-medium text-blue-700">Most profitable category</p>
            <p className="text-2xl font-bold">
              {categoryPerformance.mostProfitableCategory?.name ||
                (isLoading ? "Loading..." : "N/A")}
            </p>
            <p className="text-sm text-blue-600">
              Average margin:{" "}
              {categoryPerformance.mostProfitableCategory?.avgMargin ?? 0}%
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="font-medium text-green-700">Growing category</p>
            <p className="text-2xl font-bold">
              {categoryPerformance.fastestGrowingCategory?.name ||
                (isLoading ? "Loading..." : "N/A")}
            </p>
            <p className="text-sm text-green-600">
              +{categoryPerformance.fastestGrowingCategory?.totalSales ?? 0} this
              month
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="font-medium text-purple-700">Most reviewed category</p>
            <p className="text-2xl font-bold">
              {categoryPerformance.mostReviewedCategory?.name ||
                (isLoading ? "Loading..." : "N/A")}
            </p>
            <p className="text-sm text-purple-600">
              Average rating:{" "}
              {categoryPerformance.mostReviewedCategory?.avgRating ?? 0}/5
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-sm mb-3">Stock by category</h3>
            <table className="w-full text-sm">
              <tbody>
                {categoryPerformance.categoryPerformance
                  ?.slice(0, 4)
                  .map((category, idx) => (
                    <tr key={idx} className={idx < 3 ? "border-b" : ""}>
                      <td className="py-2">{category?.name}</td>
                      <td className="py-2 font-medium text-right">
                        {category?.totalStock} units
                      </td>
                    </tr>
                  )) ?? (
                  <tr>
                    <td className="py-2" colSpan={2}>
                      {isLoading ? "Loading data..." : "No data available"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-sm mb-3">
              Popular product-brand relationships
            </h3>
            <table className="w-full text-sm">
              <tbody>
                {categoryPerformance.popularBrandCategoryRelations
                  ?.slice(0, 4)
                  .map((relation, idx) => (
                    <tr key={idx} className={idx < 3 ? "border-b" : ""}>
                      <td className="py-2">{relation?.brandName}</td>
                      <td className="py-2 text-gray-600">
                        {relation?.categoryName}
                      </td>
                      <td className="py-2 font-medium text-right">
                        {relation?.percentage}%
                      </td>
                    </tr>
                  )) ?? (
                  <tr>
                    <td className="py-2" colSpan={3}>
                      {isLoading ? "Loading data..." : "No data available"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
