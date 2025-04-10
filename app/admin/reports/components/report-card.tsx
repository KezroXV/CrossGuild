import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ReportCardProps {
  title: string;
  children: ReactNode;
  onExport?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function ReportCard({
  title,
  children,
  onExport,
  isLoading = false,
  className = "",
}: ReportCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        {onExport && (
          <Button variant="ghost" size="sm" onClick={onExport} disabled={isLoading}>
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
