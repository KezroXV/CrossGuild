import type {
  CustomReportType,
  ReportExportType,
  ReportsData,
} from "@/features/reports/types/report.type";

export function downloadCsv(csvData: string, fileName: string) {
  const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportReportCsv(
  reportType: ReportExportType,
  data: Pick<
    ReportsData,
    | "salesData"
    | "productData"
    | "profitabilityData"
    | "customerData"
    | "ordersStats"
  >
) {
  let csvData: string;
  let fileName: string;

  switch (reportType) {
    case "sales":
      csvData =
        "Period,Sales,Profit\n" +
        data.salesData
          .map((d) => `${d.name},${d.sales},${d.profit}`)
          .join("\n");
      fileName = "sales-report.csv";
      break;
    case "products":
      csvData =
        "Product,Sales,Revenue,Stock\n" +
        data.productData
          .map((d) => `${d.name},${d.sales},${d.revenue},${d.stock}`)
          .join("\n");
      fileName = "products-report.csv";
      break;
    case "profitability":
      csvData =
        "Product,Cost,Price,Margin,Margin %,Total Profit\n" +
        data.profitabilityData
          .map(
            (d) =>
              `${d.name},${d.cost},${d.price},${d.margin},${d.marginPercentage},${d.totalProfit}`
          )
          .join("\n");
      fileName = "profitability-report.csv";
      break;
    case "customers":
      csvData =
        "Country,Customers\n" +
        data.customerData
          .map((d) => `${d.country},${d.customers}`)
          .join("\n");
      fileName = "customers-report.csv";
      break;
    case "orders": {
      const { ordersStats } = data;
      const total = ordersStats.totalOrders || 1;
      csvData =
        "Status,Count,Percentage\n" +
        `Delivered,${ordersStats.delivered},${Math.round((ordersStats.delivered / total) * 100)}%\n` +
        `In Progress,${ordersStats.inProgress},${Math.round((ordersStats.inProgress / total) * 100)}%\n` +
        `Cancelled,${ordersStats.cancelled},${Math.round((ordersStats.cancelled / total) * 100)}%\n` +
        `Returned,${ordersStats.returned},${Math.round((ordersStats.returned / total) * 100)}%\n`;
      fileName = "orders-report.csv";
      break;
    }
    default:
      return;
  }

  downloadCsv(csvData, fileName);
}

export function exportCustomReportCsv(
  reportType: CustomReportType,
  reportData: Record<string, unknown>
) {
  let csvData: string;
  let fileName: string;

  switch (reportType) {
    case "sales": {
      const dailySales = (reportData.dailySales ?? []) as Array<{
        date: string;
        sales: number;
        orders: number;
      }>;
      csvData =
        "Date,Sales,Orders\n" +
        dailySales
          .map((d) => `${d.date},${d.sales.toFixed(2)},${d.orders}`)
          .join("\n");
      fileName = "custom-sales-report.csv";
      break;
    }
    case "products": {
      const products = (reportData.products ?? []) as Array<{
        name: string;
        category: string;
        quantitySold: number;
        revenue: number;
        cost: number;
        profit: number;
        margin: string | number;
      }>;
      csvData =
        "Product,Category,Quantity Sold,Revenue,Cost,Profit,Margin\n" +
        products
          .map(
            (p) =>
              `"${p.name}","${p.category}",${p.quantitySold},${p.revenue.toFixed(2)},${p.cost.toFixed(2)},${p.profit.toFixed(2)},${p.margin}`
          )
          .join("\n");
      fileName = "custom-products-report.csv";
      break;
    }
    case "customers": {
      const customers = (reportData.customers ?? []) as Array<{
        id: string;
        name: string;
        email: string;
        orderCount: number;
        totalSpent: number;
        averageOrderValue: string | number;
      }>;
      csvData =
        "Customer ID,Name,Email,Orders,Total Spent,Avg Order Value\n" +
        customers
          .map(
            (c) =>
              `${c.id},"${c.name}",${c.email},${c.orderCount},${c.totalSpent.toFixed(2)},${c.averageOrderValue}`
          )
          .join("\n");
      fileName = "custom-customers-report.csv";
      break;
    }
    case "orders": {
      const dailyOrders = (reportData.dailyOrders ?? []) as Array<{
        date: string;
        count: number;
        revenue: number;
      }>;
      csvData =
        "Date,Orders,Revenue\n" +
        dailyOrders
          .map((d) => `${d.date},${d.count},${d.revenue.toFixed(2)}`)
          .join("\n");
      fileName = "custom-orders-report.csv";
      break;
    }
    default:
      csvData = "No data available";
      fileName = "custom-report.csv";
  }

  downloadCsv(csvData, fileName);
}
