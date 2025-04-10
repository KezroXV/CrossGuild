import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cva, type VariantProps } from "class-variance-authority";

const statsCardVariants = cva("p-4 rounded-lg", {
  variants: {
    variant: {
      default: "bg-gray-50",
      blue: "bg-blue-50",
      green: "bg-green-50",
      yellow: "bg-yellow-50",
      red: "bg-red-50",
      purple: "bg-purple-50",
      orange: "bg-orange-50",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface TextColorMap {
  [key: string]: string;
}

const textColorMap: TextColorMap = {
  default: "text-gray-700",
  blue: "text-blue-700",
  green: "text-green-700",
  yellow: "text-yellow-700",
  red: "text-red-700",
  purple: "text-purple-700",
  orange: "text-orange-700",
};

const subtextColorMap: TextColorMap = {
  default: "text-gray-600",
  blue: "text-blue-600",
  green: "text-green-600",
  yellow: "text-yellow-600",
  red: "text-red-600",
  purple: "text-purple-600",
  orange: "text-orange-600",
};

interface StatsCardProps extends VariantProps<typeof statsCardVariants> {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export function StatsCard({
  label,
  value,
  subtext,
  icon,
  variant = "default",
  trend,
  trendValue,
  className = "",
}: StatsCardProps) {
  const textColor = textColorMap[variant as string] || textColorMap.default;
  const subtextColor =
    subtextColorMap[variant as string] || subtextColorMap.default;

  return (
    <div className={statsCardVariants({ variant, className })}>
      <div className="flex justify-between items-start">
        {icon && <div className="mb-2">{icon}</div>}
        {trend && (
          <div
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              trend === "up"
                ? "bg-green-100 text-green-800"
                : trend === "down"
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "="} {trendValue}
          </div>
        )}
      </div>
      <p className={`font-medium ${textColor}`}>{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {subtext && <p className={`text-sm ${subtextColor}`}>{subtext}</p>}
    </div>
  );
}
