/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MapPin } from "lucide-react";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState("10");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/admin/orders", {
        params: { page: currentPage, pageSize: parseInt(pageSize) },
      });
      setOrders(response.data.orders);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      setError("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const response = await axios.get(`/api/admin/orders/${orderId}`);
      setSelectedOrder(response.data);
      setIsOrderDetailsOpen(true);
    } catch (error) {
      setError("Failed to fetch order details");
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await axios.patch(`/api/admin/orders/${orderId}`, {
        status: newStatus,
      });

      // Refresh the orders after update
      fetchOrders();
    } catch (error) {
      setError("Failed to update order status");
    }
  };

  const handleExportOrders = () => {
    // Create CSV content
    let csvContent = "Order ID,Customer,Items,Total,Status,Date\n";

    orders.forEach((order: any) => {
      const itemsList = order.items.map((item: any) => item.name).join("; ");
      const orderDate = format(new Date(order.createdAt), "Pp", { locale: fr });

      csvContent += `${order.id},${order.user?.name},"${itemsList}",${order.total},${order.status},${orderDate}\n`;
    });

    // Create download link
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `orders-export-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusOptions = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  // Filter orders based on search term
  const filteredOrders = orders.filter(
    (order: any) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((item: any) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      order.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Orders</h1>
        <Button
          onClick={handleExportOrders}
          variant="default"
          className="bg-accent hover:bg-accent/90"
        >
          Export Orders
        </Button>
      </div>

      {error && <p className="text-red-500 mb-6">{error}</p>}
      {loading && <p className="text-blue-500 mb-6">Loading...</p>}

      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full py-2"
        />
      </div>

      <div className="overflow-x-auto mb-8">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="border-b-2">
              <TableHead className="py-4 px-4">Order ID</TableHead>
              <TableHead className="py-4 px-4">Customer</TableHead>
              <TableHead className="py-4 px-4">City</TableHead>
              <TableHead className="py-4 px-4">Items</TableHead>
              <TableHead className="py-4 px-4">Total</TableHead>
              <TableHead className="py-4 px-4">Status</TableHead>
              <TableHead className="py-4 px-4">Date</TableHead>
              <TableHead className="py-4 px-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order: any) => (
              <TableRow key={order.id} className="hover:bg-gray-50">
                <TableCell className="py-3 px-4">{order.id}</TableCell>
                <TableCell className="py-3 px-4">{order.user?.name}</TableCell>
                <TableCell className="py-3 px-4">
                  {order.city || order.user?.city || (
                    <span className="text-gray-400 italic">Not specified</span>
                  )}
                </TableCell>
                <TableCell className="py-3 px-4">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="py-1">
                      {item.name}
                      {item.options && item.options.length > 0 && (
                        <span className="text-xs text-gray-500 block">
                          {item.options
                            .map(
                              (opt: any) =>
                                `${opt.name}: ${opt.values.join(", ")}`
                            )
                            .join(" | ")}
                        </span>
                      )}
                    </div>
                  ))}
                </TableCell>
                <TableCell className="py-3 px-4">{order.total}€</TableCell>
                <TableCell className="py-3 px-4">
                  <Select
                    value={order.status}
                    onValueChange={(value) =>
                      handleStatusUpdate(order.id, value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="py-3 px-4">
                  {format(new Date(order.createdAt), "Pp", { locale: fr })}
                </TableCell>
                <TableCell className="py-3 px-4">
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleStatusUpdate(order.id, "delivered")}
                      className="px-4 py-1 bg-green-500 hover:bg-green-600 text-white"
                      size="sm"
                    >
                      Validate
                    </Button>
                    <Button
                      onClick={() => fetchOrderDetails(order.id)}
                      className="px-4 py-1 bg-primary hover:bg-accent/90 text-white"
                      size="sm"
                    >
                      Details
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={isOrderDetailsOpen} onOpenChange={setIsOrderDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Order #{selectedOrder?.id?.slice(-8)?.toUpperCase() || ""}
            </DialogTitle>
            <DialogDescription>
              Placed on{" "}
              {selectedOrder?.createdAt &&
                format(new Date(selectedOrder.createdAt), "PPP", {
                  locale: fr,
                })}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-lg">Customer</h3>
                  <p>{selectedOrder.user?.name}</p>
                  <p>{selectedOrder.user?.email}</p>
                  <p>{selectedOrder.user?.phone}</p>
                </div>
                <div>
                  <h3 className="font-medium text-lg">Shipping</h3>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>
                      {selectedOrder.city ||
                        selectedOrder.user?.city ||
                        "No city specified"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-lg mb-2">Order Items</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Options</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium">{item.name}</div>
                          {/* Afficher la ville de livraison dans le détail */}
                          {item.city && (
                            <div className="text-xs text-muted-foreground">
                              Ville: {item.city}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.options && item.options.length > 0 ? (
                            <ul className="text-sm">
                              {item.options.map((opt: any, idx: number) => (
                                <li key={idx}>
                                  <span className="font-semibold">
                                    {opt.name}:
                                  </span>{" "}
                                  {opt.values.join(", ")}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-gray-400">None</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.price}€
                        </TableCell>
                        <TableCell className="text-right">
                          {(item.price * item.quantity).toFixed(2)}€
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-bold">
                        Order Total
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {selectedOrder.total}€
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-8 py-4">
        <div>
          <Select
            value={pageSize}
            onValueChange={(value) => setPageSize(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Items per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 per page</SelectItem>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="25">25 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-4">
          <Button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
            className="px-4"
          >
            Previous
          </Button>
          <span className="px-4 py-1">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            variant="outline"
            size="sm"
            className="px-4"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
