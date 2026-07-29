"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchReportsData,
  getDefaultDateRange,
} from "@/features/reports/services/report.service";
import type {
  ReportDateRange,
  ReportTimeframe,
} from "@/features/reports/types/report.type";

export function useReports() {
  const [timeframe, setTimeframe] = useState<ReportTimeframe>("month");
  const [compareMode, setCompareMode] = useState(false);
  const [dateRange, setDateRange] = useState<ReportDateRange>(
    getDefaultDateRange
  );

  const filters = { timeframe, dateRange };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["reports", timeframe, dateRange.from, dateRange.to],
    queryFn: () => fetchReportsData(filters),
  });

  const handleDateChange = (field: keyof ReportDateRange, value: string) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
  };

  return {
    timeframe,
    setTimeframe,
    compareMode,
    setCompareMode,
    dateRange,
    handleDateChange,
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch,
    salesData: data?.salesData ?? [],
    categoryData: data?.categoryData ?? [],
    productData: data?.productData ?? [],
    profitabilityData: data?.profitabilityData ?? [],
    customerData: data?.customerData ?? [],
    customerCategoryData: data?.customerCategoryData ?? [],
    customerSegments: data?.customerSegments ?? {
      newCustomers: "Loading...",
      returningCustomers: "Loading...",
    },
    ordersStats: data?.ordersStats ?? {
      totalOrders: 0,
      delivered: 0,
      inProgress: 0,
      cancelled: 0,
      returned: 0,
    },
    categoryPerformance: data?.categoryPerformance ?? {
      categoryPerformance: [],
      mostProfitableCategory: null,
      fastestGrowingCategory: null,
      mostReviewedCategory: null,
      popularBrandCategoryRelations: [],
    },
  };
}
