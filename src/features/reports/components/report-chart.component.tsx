"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CHART_COLORS = [
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#4BC0C0",
  "#9966FF",
  "#FF9F40",
  "#8AC054",
  "#5D9CEC",
  "#DADAEB",
  "#F49AC2",
];

export function getColorByIndex(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

type ChartDataPoint = Record<string, string | number>;

type ReportLineChartProps = {
  data: ChartDataPoint[];
  xKey?: string;
  lines: Array<{ dataKey: string; stroke: string; name?: string }>;
  height?: number;
};

export function ReportLineChart({
  data,
  xKey = "name",
  lines,
  height = 300,
}: ReportLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        {lines.map((line) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.stroke}
            name={line.name}
            activeDot={{ r: 8 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

type ReportBarChartProps = {
  data: ChartDataPoint[];
  xKey?: string;
  bars: Array<{ dataKey: string; fill: string; name?: string }>;
  height?: number;
  tickFontSize?: number;
};

export function ReportBarChart({
  data,
  xKey = "name",
  bars,
  height = 300,
  tickFontSize,
}: ReportBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey={xKey}
          tick={tickFontSize ? { fontSize: tickFontSize } : undefined}
        />
        <YAxis />
        <Tooltip />
        <Legend />
        {bars.map((bar) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            fill={bar.fill}
            name={bar.name}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

type PieDataPoint = {
  name: string;
  value: number;
  color?: string;
};

type ReportPieChartProps = {
  data: PieDataPoint[];
  height?: number;
  outerRadius?: number;
  labelMode?: "percent" | "custom";
  tooltipFormatter?: (value: number) => [string, string];
};

export function ReportPieChart({
  data,
  height = 300,
  outerRadius = 80,
  labelMode = "percent",
  tooltipFormatter,
}: ReportPieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={outerRadius}
          fill="#8884d8"
          dataKey="value"
          label={
            labelMode === "percent"
              ? ({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
              : undefined
          }
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color ?? getColorByIndex(index)}
            />
          ))}
        </Pie>
        <Tooltip formatter={tooltipFormatter} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
