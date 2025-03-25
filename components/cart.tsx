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
import { Trash2, Plus, Minus } from "lucide-react";

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
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);
  const router = useRouter();

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

  useEffect(() => {
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

  const handleRemoveItem = async (itemId: string) => {
    setUpdateLoading(itemId);
    try {
      const response = await fetch(`/api/cart?itemId=${itemId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        fetchCart(); // Refresh cart after removal
      } else {
        alert(data.error || "Failed to remove item");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      alert("An error occurred while removing the item");
    } finally {
      setUpdateLoading(null);
    }
  };

  const updateItemQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdateLoading(itemId);
    try {
      const response = await fetch("/api/cart", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId,
          quantity: newQuantity,
        }),
      });

      const data = await response.json();

      if (data.success) {
        fetchCart(); // Refresh cart after update
      } else {
        alert(data.error || "Failed to update quantity");
      }
    } catch (error) {
      console.error("Error updating item quantity:", error);
      alert("An error occurred while updating the quantity");
    } finally {
      setUpdateLoading(null);
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg mb-4">Your cart is empty</p>
          <Button
            onClick={() => router.push("/")}
            className="bg-accent text-white"
          >
            Continue Shopping
          </Button>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-accent font-bold">Product</TableHead>
                <TableHead className="text-accent font-bold">Price</TableHead>
                <TableHead className="text-accent font-bold">
                  Quantity
                </TableHead>
                <TableHead className="text-accent font-bold">Total</TableHead>
                <TableHead className="text-accent font-bold">Actions</TableHead>
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
                        className="w-12 h-12 object-cover mr-4 rounded"
                      />
                      <span>{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{item.price.toFixed(2)}€</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateItemQuantity(item.id, item.quantity - 1)
                        }
                        disabled={
                          updateLoading === item.id || item.quantity <= 1
                        }
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 hover:bg-primary"
                        onClick={() =>
                          updateItemQuantity(item.id, item.quantity + 1)
                        }
                        disabled={updateLoading === item.id}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {(item.price * item.quantity).toFixed(2)}€
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-100"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={updateLoading === item.id}
                    >
                      {updateLoading === item.id ? (
                        <span className="animate-spin">...</span>
                      ) : (
                        <Trash2 className="h-5 w-5" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-6 border-t pt-4">
            <div className="flex justify-end text-right mb-6">
              <div>
                <p className="text-lg font-bold">
                  Subtotal: {subtotal.toFixed(2)}€
                </p>
                <p className="text-sm text-muted-foreground">
                  Taxes and shipping calculated at checkout
                </p>
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                className="border-2 border-primary bg-white text-black hover:bg-primary"
                onClick={() => router.push("/")}
              >
                Continue Shopping
              </Button>
              <Button
                onClick={handleCreateOrder}
                disabled={isLoading || cartItems.length === 0}
                className="bg-accent text-white hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Processing..." : "Checkout"}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
