import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { sampleProductData } from "./data/mockData";
import { Skeleton } from "./ui/Skeleton";

interface ProductsReportsProps {
  isLoading: boolean;
}

export default function ProductsReports({ isLoading }: ProductsReportsProps) {
  const [productData] = useState(sampleProductData);

  const handleExportCSV = () => {
    const csvData =
      "Product,Sales,Revenue,Stock\n" +
      productData
        .map((d) => `${d.name},${d.sales},${d.revenue},${d.stock}`)
        .join("\n");
    const fileName = "products-report.csv";

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Product list item skeleton
  const ProductItemSkeleton = () => (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-6" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex gap-6">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );

  // Inventory stats skeleton
  const InventoryStatsSkeleton = () => (
    <div className="grid grid-cols-3 gap-4 mb-4">
      <div className="p-3 rounded-lg bg-muted/20">
        <Skeleton className="h-3 w-24 mb-2" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="p-3 rounded-lg bg-muted/20">
        <Skeleton className="h-3 w-24 mb-2" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="p-3 rounded-lg bg-muted/20">
        <Skeleton className="h-3 w-24 mb-2" />
        <Skeleton className="h-5 w-16" />
      </div>
    </div>
  );

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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Best Sellers Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Best Selling Products</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleExportCSV}
              disabled={isLoading}
            ></Button>
              <Download className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <ProductItemSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {productData.slice(0, 5).map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-500">
                        #{index + 1}
                      </span>
                      <span>{product.name}</span>
                    </div>
                    <div className="flex gap-6">
                      <span className="text-gray-500">
                        {product.sales} units
                      </span>
                      <span className="font-medium">${product.revenue}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inventory Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Status</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <InventoryStatsSkeleton />
                <Skeleton className="h-[200px] w-full" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Healthy Stock</p>
                    <p className="text-xl font-bold">85 products</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Low Stock</p>
                    <p className="text-xl font-bold">12 products</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Out of Stock</p>
                    <p className="text-xl font-bold">5 products</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={productData.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="stock" fill="#82ca9d" name="Current Stock" />
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Products Profitability */}
      <Card>
        <CardHeader>
          <CardTitle>Product Profitability</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : (
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
                <tbody>                  <tr className="bg-white border-b">
                    <td className="px-6 py-4">Gaming Mouse X1</td>
                    <td className="px-6 py-4">€15</td>
                    <td className="px-6 py-4">€30</td>
                    <td className="px-6 py-4">€15</td>
                    <td className="px-6 py-4">50%</td>
                    <td className="px-6 py-4">€1,800</td>
                  </tr>
                  <tr className="bg-white border-b">
                    <td className="px-6 py-4">Mechanical Keyboard Pro</td>
                    <td className="px-6 py-4">€45</td>
                    <td className="px-6 py-4">€100</td>
                    <td className="px-6 py-4">€55</td>
                    <td className="px-6 py-4">55%</td>
                    <td className="px-6 py-4">€5,225</td>
                  </tr>
                  <tr className="bg-white border-b">
                    <td className="px-6 py-4">Ultra HD Monitor</td>
                    <td className="px-6 py-4">€95</td>
                    <td className="px-6 py-4">€150</td>
                    <td className="px-6 py-4">€55</td>
                    <td className="px-6 py-4">36.7%</td>
                    <td className="px-6 py-4">€4,400</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
