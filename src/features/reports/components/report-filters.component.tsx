"use client";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type {
  ReportDateRange,
  ReportTimeframe,
} from "@/features/reports/types/report.type";

type ReportFiltersProps = {
  timeframe: ReportTimeframe;
  onTimeframeChange: (value: ReportTimeframe) => void;
  dateRange: ReportDateRange;
  onDateChange: (field: keyof ReportDateRange, value: string) => void;
  compareMode: boolean;
  onCompareModeToggle: () => void;
};

export default function ReportFilters({
  timeframe,
  onTimeframeChange,
  dateRange,
  onDateChange,
  compareMode,
  onCompareModeToggle,
}: ReportFiltersProps) {
  return (
    <div className="flex gap-4">
      <Select
        value={timeframe}
        onValueChange={(v) => onTimeframeChange(v as ReportTimeframe)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select timeframe" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="day">Today</SelectItem>
          <SelectItem value="week">This Week</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
          <SelectItem value="quarter">This Quarter</SelectItem>
          <SelectItem value="year">This Year</SelectItem>
          <SelectItem value="custom">Custom Range</SelectItem>
        </SelectContent>
      </Select>

      {timeframe === "custom" && (
        <div className="flex gap-2">
          <Input
            type="date"
            value={dateRange.from}
            onChange={(e) => onDateChange("from", e.target.value)}
            className="w-36"
          />
          <Input
            type="date"
            value={dateRange.to}
            onChange={(e) => onDateChange("to", e.target.value)}
            className="w-36"
          />
        </div>
      )}

      <Button variant="outline" onClick={onCompareModeToggle}>
        {compareMode ? "Disable Comparison" : "Compare Periods"}
      </Button>
    </div>
  );
}
