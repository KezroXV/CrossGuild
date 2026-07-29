"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Button } from "@/shared/components/ui/button";
import ReportFilters from "@/features/reports/components/report-filters.component";
import SalesReportTab from "@/features/reports/components/sales-report-tab.component";
import ProductsReportTab from "@/features/reports/components/products-report-tab.component";
import CustomersReportTab from "@/features/reports/components/customers-report-tab.component";
import OrdersReportTab from "@/features/reports/components/orders-report-tab.component";
import CustomReportBuilder from "@/features/reports/components/custom-report-builder.component";
import { useReports } from "@/features/reports/hooks/use-reports.hook";
import { exportReportCsv } from "@/features/reports/services/report.service";

export default function ReportsView() {
  const {
    timeframe,
    setTimeframe,
    compareMode,
    setCompareMode,
    dateRange,
    handleDateChange,
    isLoading,
    error,
    refetch,
    salesData,
    categoryData,
    productData,
    profitabilityData,
    customerData,
    customerCategoryData,
    customerSegments,
    ordersStats,
    categoryPerformance,
  } = useReports();

  const exportData = {
    salesData,
    productData,
    profitabilityData,
    customerData,
    ordersStats,
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 p-4 rounded-md border border-red-200 mb-6">
          <h2 className="text-red-800 font-medium">Error loading data</h2>
          <p className="text-red-700">{error}</p>
          <Button variant="outline" className="mt-2" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics & Reports</h1>
        <ReportFilters
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
          dateRange={dateRange}
          onDateChange={handleDateChange}
          compareMode={compareMode}
          onCompareModeToggle={() => setCompareMode(!compareMode)}
        />
      </div>

      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <SalesReportTab
            isLoading={isLoading}
            compareMode={compareMode}
            salesData={salesData}
            categoryData={categoryData}
            categoryPerformance={categoryPerformance}
            onExport={() => exportReportCsv("sales", exportData)}
          />
        </TabsContent>

        <TabsContent value="products">
          <ProductsReportTab
            isLoading={isLoading}
            productData={productData}
            profitabilityData={profitabilityData}
            onExportProducts={() => exportReportCsv("products", exportData)}
            onExportProfitability={() =>
              exportReportCsv("profitability", exportData)
            }
          />
        </TabsContent>

        <TabsContent value="customers">
          <CustomersReportTab
            isLoading={isLoading}
            customerCategoryData={customerCategoryData}
            customerSegments={customerSegments}
          />
        </TabsContent>

        <TabsContent value="orders">
          <OrdersReportTab ordersStats={ordersStats} />
        </TabsContent>
      </Tabs>

      <CustomReportBuilder />
    </div>
  );
}
