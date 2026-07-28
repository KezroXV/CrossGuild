export type OrderColumn = {
  id: string;
  customerName: string;
  totalAmount: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
};

export const columns = [
  {
    id: "id",
    header: "Order ID",
  },
  {
    id: "customerName",
    header: "Customer",
  },
  {
    id: "totalAmount",
    header: "Total",
  },
  {
    id: "status",
    header: "Status",
  },
  {
    id: "paymentStatus",
    header: "Payment",
  },
  {
    id: "createdAt",
    header: "Date",
  },
];
