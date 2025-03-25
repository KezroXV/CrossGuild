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

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState("10");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOrders();
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
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <Button
          onClick={handleExportOrders}
          variant="default"
          className="bg-blue-500 hover:bg-blue-600"
        >
          Export Orders
        </Button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && <p className="text-blue-500 mb-4">Loading...</p>}

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrders.map((order: any) => (
            <TableRow key={order.id}>
              <TableCell>{order.id}</TableCell>
              <TableCell>{order.user?.name}</TableCell>
              <TableCell>
                {order.items.map((item: any) => (
                  <div key={item.id}>{item.name}</div>
                ))}
              </TableCell>
              <TableCell>{order.total}€</TableCell>
              <TableCell>
                <Select
                  value={order.status}
                  onValueChange={(value) => handleStatusUpdate(order.id, value)}
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
              <TableCell>
                {format(new Date(order.createdAt), "Pp", { locale: fr })}
              </TableCell>
              <TableCell>
                <Button
                  onClick={() => handleStatusUpdate(order.id, "delivered")}
                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white mr-2"
                  size="sm"
                >
                  Validate
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-6">
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
        <div className="flex gap-2">
          <Button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
          >
            Previous
          </Button>
          <span className="px-3 py-1">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            variant="outline"
            size="sm"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
