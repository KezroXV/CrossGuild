"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import ReportHeader from "./components/ReportHeader";
import SalesReports from "./components/SalesReports";
import ProductsReports from "./components/ProductsReports";
import CustomersReports from "./components/CustomersReports";
import OrdersReports from "./components/OrdersReports";
import MarketingReports from "./components/MarketingReports";
import CustomReportBuilder from "./components/CustomReportBuilder";

export default function ReportsPage() {
  const [timeframe, setTimeframe] = useState("month");
  const [compareMode, setCompareMode] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1))
      .toISOString()
      .split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [customerMetrics, setCustomerMetrics] = useState({
    avgOrderValue: 0,
    customerLifetimeValue: 0,
    repeatCustomerPercentage: 0,
    newVsReturningRatio: "0% / 0%",
    percentChange: 0,
  });

  // Handle date selection for custom ranges

  const handleDateChange = (field: string, value: string): void => {
    setDateRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Fetch customer metrics data
  useEffect(() => {
    const fetchCustomerMetrics = async () => {
      setIsLoading(true);
      try {
        const metricsResponse = await fetch(
          `/api/reports/customer-metrics?timeframe=${timeframe}&from=${dateRange.from}&to=${dateRange.to}`
        );
        if (metricsResponse.ok) {
          const metricsData = await metricsResponse.json();
          setCustomerMetrics(metricsData);
        }

        // Simulate loading delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching customer metrics:", error);
        setIsLoading(false);
      }
    };

    fetchCustomerMetrics();
  }, [timeframe, dateRange]);

  return (
    <div className="container mx-auto p-6 space-y-8">
      <ReportHeader
        timeframe={timeframe}
        setTimeframe={setTimeframe}
        dateRange={dateRange}
        handleDateChange={handleDateChange}
        compareMode={compareMode}
        setCompareMode={setCompareMode}
      />

      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <SalesReports isLoading={isLoading} compareMode={compareMode} />
        </TabsContent>

        <TabsContent value="products">
          <ProductsReports isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="customers">
          <CustomersReports
            isLoading={isLoading}
            customerMetrics={customerMetrics}
          />
        </TabsContent>

        <TabsContent value="orders">
          <OrdersReports isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="marketing">
          <MarketingReports isLoading={isLoading} />
        </TabsContent>
      </Tabs>

      <CustomReportBuilder />
    </div>
  );
}
