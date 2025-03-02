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
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get("/api/admin/orders");
      setOrders(response.data);
    } catch (error) {
      setError("Failed to fetch orders");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order: any) => (
            <TableRow key={order.id}>
              <TableCell>{order.id}</TableCell>
              <TableCell>{order.user?.name}</TableCell>
              <TableCell>
                {order.items.map((item: any) => (
                  <div key={item.id}>{item.name}</div>
                ))}
              </TableCell>
              <TableCell>{order.total}€</TableCell>
              <TableCell>{order.status}</TableCell>
              <TableCell>
                {format(new Date(order.createdAt), "Pp", { locale: fr })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrdersPage;
