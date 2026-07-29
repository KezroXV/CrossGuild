"use client";

import { Button } from "@/shared/components/ui/button";
import { Download } from "lucide-react";

type ExportButtonProps = {
  onExport: () => void;
  label?: string;
};

export default function ExportButton({
  onExport,
  label = "Export",
}: ExportButtonProps) {
  return (
    <Button variant="ghost" size="icon" onClick={onExport} title={label}>
      <Download className="h-4 w-4" />
    </Button>
  );
}
