import { getCustomReportStartDate } from "@/features/reports/server/custom-report-utils.server";
import {
  generateCustomProductsReport,
  generateCustomSalesReport,
} from "@/features/reports/server/custom-report-generators.server";
import {
  generateCustomCustomersReport,
  generateCustomOrdersReport,
} from "@/features/reports/server/custom-report-generators-2.server";

export async function getCustomReport(params: {
  reportType?: string;
  timeframe?: string;
  format?: string;
} = {}) {
  const reportType = params.reportType || "sales";
  const timeframe = params.timeframe || "month";
  const format = params.format || "csv";

  const startDate = getCustomReportStartDate(timeframe);
  const endDate = new Date();

  let reportData;

  switch (reportType) {
    case "sales":
      reportData = await generateCustomSalesReport(startDate, endDate);
      break;
    case "products":
      reportData = await generateCustomProductsReport(startDate, endDate);
      break;
    case "customers":
      reportData = await generateCustomCustomersReport(startDate, endDate);
      break;
    case "orders":
      reportData = await generateCustomOrdersReport(startDate, endDate);
      break;
    default:
      reportData = await generateCustomSalesReport(startDate, endDate);
  }

  return {
    success: true,
    reportData,
    format,
    dateRange: {
      from: startDate,
      to: endDate,
    },
  };
}
