"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "./ui/table";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  images: { url: string }[];
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch("/api/cart");
        const data = await response.json();
        setCartItems(data.items || []);
        calculateSubtotal(data.items || []);
      } catch (error) {
        console.error("Failed to fetch cart:", error);
      }
    };

    fetchCart();
  }, []);

  const calculateSubtotal = (items: CartItem[]) => {
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setSubtotal(total);
  };

  const handleCreateOrder = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to order confirmation page with the order ID
        router.push(`/order-confirmation?orderId=${data.order.id}`);
      } else {
        alert(data.error || "Failed to create order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert("An error occurred while creating your order");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-accent font-bold">Product</TableHead>
            <TableHead className="text-accent font-bold">Price</TableHead>
            <TableHead className="text-accent font-bold">Quantity</TableHead>
            <TableHead className="text-accent font-bold">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cartItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="flex items-center">
                  <img
                    src={item.images[0]?.url || "/placeholder.png"}
                    alt={item.name}
                    className="w-12 h-12 object-cover mr-4"
                  />
                  <span>{item.name}</span>
                </div>
              </TableCell>
              <TableCell>{item.price.toFixed(2)}€</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>{(item.price * item.quantity).toFixed(2)}€</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 text-right">
        <p className="text-lg font-bold">Subtotal: {subtotal.toFixed(2)}€</p>
        <p className="text-sm text-muted-foreground">
          Taxes and shipping calculated at checkout
        </p>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Button
          onClick={() => router.push("/")}
          variant="outline"
          className="border-2 border-accent bg-white text-black hover:bg-blue-600"
        >
          Go to Home
        </Button>
        <Button
          onClick={handleCreateOrder}
          disabled={isLoading || cartItems.length === 0}
          className="bg-accent text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Processing..." : "Buy it Now"}
        </Button>
      </div>
    </div>
  );
};

export default Cart;
