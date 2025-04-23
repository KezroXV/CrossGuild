import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Skeleton } from "./ui/Skeleton";

interface CustomReportBuilderProps {
  isLoading?: boolean;
}

export default function CustomReportBuilder({
  isLoading = false,
}: CustomReportBuilderProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  // Form field skeleton
  const FormFieldSkeleton = () => (
    <div>
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-10 w-full" />
    </div>
  );

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Custom Report Builder</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading || isGenerating ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <FormFieldSkeleton />
              <FormFieldSkeleton />
              <FormFieldSkeleton />
            </div>
            <div className="flex justify-between">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-9 w-40" />
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <Label htmlFor="report-type">Report Type</Label>
                <Select defaultValue="sales">
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
                <Select defaultValue="last30days">
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
                <Select defaultValue="csv">
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
              <Button className="bg-primary" onClick={handleGenerateReport}>
                Generate Custom Report
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
