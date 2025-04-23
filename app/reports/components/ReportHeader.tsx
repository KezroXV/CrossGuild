import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "./ui/Skeleton";

interface ReportHeaderProps {
  timeframe: string;
  setTimeframe: (value: string) => void;
  dateRange: {
    from: string;
    to: string;
  };
  handleDateChange: (field: string, value: string) => void;
  compareMode: boolean;
  setCompareMode: (value: boolean) => void;
  isLoading?: boolean;
}

export default function ReportHeader({
  timeframe,
  setTimeframe,
  dateRange,
  handleDateChange,
  compareMode,
  setCompareMode,
  isLoading = false,
}: ReportHeaderProps) {
  if (isLoading) {
    return (
      <div className="flex justify-between items-center">
        <Skeleton className="h-9 w-48" />
        <div className="flex gap-4">
          <Skeleton className="h-9 w-[180px]" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">Analytics & Reports</h1>
      <div className="flex gap-4">
        <Select value={timeframe} onValueChange={setTimeframe}>
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
            <div>
              <Input
                type="date"
                value={dateRange.from}
                onChange={(e) => handleDateChange("from", e.target.value)}
                className="w-36"
              />
            </div>
            <div>
              <Input
                type="date"
                value={dateRange.to}
                onChange={(e) => handleDateChange("to", e.target.value)}
                className="w-36"
              />
            </div>
          </div>
        )}

        <Button variant="outline" onClick={() => setCompareMode(!compareMode)}>
          {compareMode ? "Disable Comparison" : "Compare Periods"}
        </Button>
      </div>
    </div>
  );
}
