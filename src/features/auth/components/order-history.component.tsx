"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/components/ui/pagination";
import {
  formatOrderAmount,
  getOrderStatusLabel,
  isOrderCancellable,
} from "@/features/auth/hooks/use-orders.hook";
import type { UserOrder } from "@/features/auth/types/profile.type";

type OrderHistoryProps = {
  orders: UserOrder[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  selectedOrder: UserOrder | null;
  isOrderDetailsOpen: boolean;
  setIsOrderDetailsOpen: (open: boolean) => void;
  isCancelDialogOpen: boolean;
  setIsCancelDialogOpen: (open: boolean) => void;
  onViewOrder: (order: UserOrder) => void;
  onCancelOrder: (order: UserOrder) => void;
  onConfirmCancel: () => void;
  onPageChange: (page: number) => void;
  isCancelling: boolean;
};

function OrderStatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();
  const label = getOrderStatusLabel(status);

  switch (normalized) {
    case "PENDING":
      return <Badge variant="outline">{label}</Badge>;
    case "PROCESSING":
      return <Badge variant="secondary">{label}</Badge>;
    case "SHIPPED":
    case "DELIVERED":
      return <Badge variant="default">{label}</Badge>;
    case "CANCELLED":
      return <Badge variant="destructive">{label}</Badge>;
    default:
      return <Badge variant="outline">{label}</Badge>;
  }
}

export function OrderHistory({
  orders,
  isLoading,
  currentPage,
  totalPages,
  selectedOrder,
  isOrderDetailsOpen,
  setIsOrderDetailsOpen,
  isCancelDialogOpen,
  setIsCancelDialogOpen,
  onViewOrder,
  onCancelOrder,
  onConfirmCancel,
  onPageChange,
  isCancelling,
}: OrderHistoryProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>View all your past orders.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-6">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-6">
              You don&apos;t have any orders yet.
            </div>
          ) : (
            <>
              <Table>
                <TableCaption>List of your orders</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.orderNumber || "N/A"}
                      </TableCell>
                      <TableCell>
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {formatOrderAmount(order.totalAmount)} €
                      </TableCell>
                      <TableCell>
                        <OrderStatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewOrder(order)}
                          >
                            View
                          </Button>
                          {isOrderCancellable(order.status) && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => onCancelOrder(order)}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <Pagination className="mt-4">
                  <PaginationContent>
                    {currentPage > 1 && (
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            onPageChange(currentPage - 1);
                          }}
                        />
                      </PaginationItem>
                    )}

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            isActive={page === currentPage}
                            onClick={(e) => {
                              e.preventDefault();
                              onPageChange(page);
                            }}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}

                    {currentPage < totalPages && (
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            onPageChange(currentPage + 1);
                          }}
                        />
                      </PaginationItem>
                    )}
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isOrderDetailsOpen} onOpenChange={setIsOrderDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.orderNumber || "N/A"} -{" "}
              {selectedOrder?.createdAt
                ? new Date(selectedOrder.createdAt).toLocaleDateString()
                : "N/A"}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">
                    <OrderStatusBadge status={selectedOrder.status} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="font-medium">
                    {formatOrderAmount(selectedOrder.totalAmount)} €
                  </p>
                </div>
              </div>

              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items?.length > 0 ? (
                      selectedOrder.items.map((item, index) => {
                        const unitPrice =
                          item.price ?? item.unitPrice ?? 0;
                        const quantity = item.quantity || 1;

                        return (
                          <TableRow key={item.id ?? index}>
                            <TableCell className="font-medium">
                              {item.product?.name ||
                                item.name ||
                                "Unknown Product"}
                            </TableCell>
                            <TableCell>{quantity}</TableCell>
                            <TableCell>
                              {formatOrderAmount(unitPrice)} €
                            </TableCell>
                            <TableCell className="text-right">
                              {formatOrderAmount(unitPrice * quantity)} €
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          No items found in this order
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end space-x-2">
                {isOrderCancellable(selectedOrder.status) && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setIsOrderDetailsOpen(false);
                      onCancelOrder(selectedOrder);
                    }}
                  >
                    Cancel Order
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setIsOrderDetailsOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this order? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>
              No, keep order
            </AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmCancel} disabled={isCancelling}>
              {isCancelling ? "Cancelling..." : "Yes, cancel order"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
