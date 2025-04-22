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
import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  ImageIcon,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { LoadingState } from "./ui/loading-state";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  images: { url: string }[];
  options?: Array<{
    name: string;
    values: string[];
  }>;
  city?: string;
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const { theme, resolvedTheme } = useTheme();
  const router = useRouter();
  const { data: session } = useSession();

  const fetchCart = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/cart");
      const data = await response.json();
      setCartItems(data.items || []);
      calculateSubtotal(data.items || []);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      toast.error("Failed to load your cart");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const city = session?.user?.city || "";

      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          city,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/order-confirmation?orderId=${data.order.id}`);
        toast.success("Order created successfully!");
      } else {
        toast.error(data.error || "Failed to create order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("An error occurred while creating your order");
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
        toast.success("Item removed from cart");
      } else {
        toast.error(data.error || "Failed to remove item");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("An error occurred while removing the item");
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
        toast.success("Quantity updated");
      } else {
        toast.error(data.error || "Failed to update quantity");
      }
    } catch (error) {
      console.error("Error updating item quantity:", error);
      toast.error("An error occurred while updating the quantity");
    } finally {
      setUpdateLoading(null);
    }
  };

  const handleImageError = (itemId: string) => {
    setImageErrors((prev) => ({
      ...prev,
      [itemId]: true,
    }));
  };

  if (isLoading) {
    return <LoadingState type="cart" title="Loading your cart..." />;
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold mb-2">Your Cart</h1>
        <p className="text-muted-foreground">
          {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your
          cart
        </p>
      </motion.div>

      {cartItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center py-12 bg-muted/50 rounded-lg dark:bg-muted/10 border dark:border-border"
        >
          <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl mb-4">Your cart is empty</p>
          <p className="text-muted-foreground mb-6">
            Add items to your cart to proceed with checkout
          </p>
          <Button
            onClick={() => router.push("/")}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            size="lg"
          >
            Continue Shopping
          </Button>
        </motion.div>
      ) : (
        <>
          <div className="bg-card rounded-lg shadow-sm p-4 mb-6 border dark:border-border dark:shadow-none overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 dark:bg-muted/10 hover:bg-muted/40 dark:hover:bg-muted/20">
                  <TableHead className="text-accent font-bold">
                    Product
                  </TableHead>
                  <TableHead className="text-accent font-bold">Price</TableHead>
                  <TableHead className="text-accent font-bold">
                    Details
                  </TableHead>
                  <TableHead className="text-accent font-bold">City</TableHead>
                  <TableHead className="text-accent font-bold">
                    Quantity
                  </TableHead>
                  <TableHead className="text-accent font-bold">Total</TableHead>
                  <TableHead className="text-accent font-bold">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {cartItems.map((item) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="group hover:bg-muted/20 dark:hover:bg-muted/10"
                      layout
                    >
                      <TableCell>
                        <div className="flex items-center">
                          <div className="relative overflow-hidden rounded-md">
                            {imageErrors[item.id] || !item.images[0]?.url ? (
                              <div className="w-20 h-20 flex items-center justify-center bg-muted/30 dark:bg-muted/10 rounded-md mr-4">
                                <ImageIcon className="w-10 h-10 text-muted-foreground" />
                              </div>
                            ) : (
                              <motion.img
                                src={item.images[0]?.url}
                                alt={item.name}
                                className="w-20 h-20 object-cover mr-4 rounded-md"
                                onError={() => handleImageError(item.id)}
                                initial={{ opacity: 0.6 }}
                                animate={{ opacity: 1 }}
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.2 }}
                              />
                            )}
                            {!imageErrors[item.id] &&
                              item.images.length > 1 && (
                                <Badge
                                  variant="secondary"
                                  className="absolute -top-2 -right-2 z-10 dark:bg-accent/30 dark:text-foreground"
                                >
                                  +{item.images.length - 1}
                                </Badge>
                              )}
                          </div>
                          <div className="max-w-xs">
                            <h3 className="font-medium text-lg hover:text-accent cursor-pointer transition-colors">
                              {item.name}
                            </h3>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{item.price.toFixed(2)}€</TableCell>
                      <TableCell>
                        {item.options?.map((option, idx) => (
                          <p
                            key={idx}
                            className="text-sm text-muted-foreground"
                          >
                            <span className="font-semibold">
                              {option.name}:
                            </span>{" "}
                            {option.values.join(", ")}
                          </p>
                        ))}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{item.city || "N/A"}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateItemQuantity(
                                item.id,
                                Math.max(1, item.quantity - 1)
                              )
                            }
                            disabled={updateLoading === item.id}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
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
                          className="text-red-500 hover:text-white hover:bg-red-500 transition-colors dark:text-red-400 dark:hover:bg-red-900"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={updateLoading === item.id}
                        >
                          {updateLoading === item.id ? (
                            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
            <div className="mt-6 border-t pt-4 dark:border-border">
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
              <div className="flex flex-col sm:flex-row justify-between mt-6 gap-4">
                <Button
                  variant="outline"
                  className="border-2 border-primary hover:bg-primary/10 transition-colors w-full sm:w-auto dark:border-primary dark:text-primary-foreground dark:hover:bg-primary/20"
                  onClick={() => router.push("/")}
                >
                  Continue Shopping
                </Button>
                <Button
                  onClick={handleCreateOrder}
                  disabled={isLoading || cartItems.length === 0}
                  className="bg-accent hover:bg-accent/90 transition-colors w-full sm:w-auto dark:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>Processing...</>
                  ) : (
                    <>
                      Checkout <ArrowRight size={16} />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
