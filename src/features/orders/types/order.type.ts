import { OrderStatus } from "@prisma/client";

export { OrderStatus };

export const ORDER_STATUSES = [
  OrderStatus.pending,
  OrderStatus.processing,
  OrderStatus.shipped,
  OrderStatus.delivered,
  OrderStatus.cancelled,
] as const;

export const CANCELLABLE_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.pending,
  OrderStatus.processing,
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.pending]: "Pending",
  [OrderStatus.processing]: "Processing",
  [OrderStatus.shipped]: "Shipped",
  [OrderStatus.delivered]: "Delivered",
  [OrderStatus.cancelled]: "Cancelled",
};

export function isOrderCancellable(status: OrderStatus): boolean {
  return CANCELLABLE_ORDER_STATUSES.includes(status);
}

export function getOrderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}
