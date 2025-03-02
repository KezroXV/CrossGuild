"use client";

import React from "react";
import { OrderColumn, columns } from "./columns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface OrdersClientProps {
  orders: OrderColumn[];
}

const OrdersClient = ({ orders }: OrdersClientProps) => {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.id}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.id}</TableCell>
              <TableCell>{order.customerName}</TableCell>
              <TableCell>{order.totalAmount}</TableCell>
              <TableCell>{order.status}</TableCell>
              <TableCell>{order.paymentStatus}</TableCell>
              <TableCell>{order.createdAt}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrdersClient;
