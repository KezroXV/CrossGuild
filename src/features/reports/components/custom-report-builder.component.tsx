"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  exportCustomReportCsv,
  fetchCustomReport,
} from "@/features/reports/services/report.service";
import type {
  CustomReportTimeframe,
  CustomReportType,
} from "@/features/reports/types/report.type";

export default function CustomReportBuilder() {
  const [reportType, setReportType] = useState<CustomReportType>("sales");
  const [reportTimeframe, setReportTimeframe] =
    useState<CustomReportTimeframe>("last30days");
  const [reportFormat, setReportFormat] = useState("csv");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCustomExport = async () => {
    setIsGenerating(true);
    try {
      const result = await fetchCustomReport({
        reportType,
        timeframe: reportTimeframe,
        format: reportFormat,
      });

      exportCustomReportCsv(reportType, result.reportData);
      toast.success("Custom report generated successfully");
    } catch (error) {
      console.error("Error generating custom report:", error);
      toast.error("Failed to generate custom report");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Custom Report Builder</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <Label htmlFor="report-type">Report Type</Label>
            <Select
              value={reportType}
              onValueChange={(v) => setReportType(v as CustomReportType)}
            >
              <SelectTrigger id="report-type">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Sales Report</SelectItem>
                <SelectItem value="products">Product Report</SelectItem>
                <SelectItem value="customers">Customer Analysis</SelectItem>
                <SelectItem value="orders">Order Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="report-period">Time Period</Label>
            <Select
              value={reportTimeframe}
              onValueChange={(v) =>
                setReportTimeframe(v as CustomReportTimeframe)
              }
            >
              <SelectTrigger id="report-period">
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="last7days">Last 7 Days</SelectItem>
                <SelectItem value="last30days">Last 30 Days</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="lastMonth">Last Month</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="report-format">Export Format</Label>
            <Select value={reportFormat} onValueChange={setReportFormat}>
              <SelectTrigger id="report-format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox id="scheduled" />
            <Label htmlFor="scheduled" className="text-sm font-medium">
              Schedule regular delivery of this report
            </Label>
          </div>
          <Button
            onClick={handleCustomExport}
            className="bg-primary hover:bg-primary/90"
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate Custom Report"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
