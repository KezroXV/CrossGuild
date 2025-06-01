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
  User,
  MapPin,
  CreditCard,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { LoadingState } from "./ui/loading-state";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

// Delivery information form schema
const deliveryInfoSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phone: z.string().min(8, "Phone number must be at least 8 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  postalCode: z.string().min(3, "Postal code must be at least 3 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
});

type DeliveryInfo = z.infer<typeof deliveryInfoSchema>;

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
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  // Delivery form
  const deliveryForm = useForm<DeliveryInfo>({
    resolver: zodResolver(deliveryInfoSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      country: "France",
    },
  });

  // Pre-populate form with user data
  useEffect(() => {
    if (session?.user) {
      const user = session.user as any;
      deliveryForm.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        postalCode: user.postalCode || "",
        country: user.country || "France",
      });
    }
  }, [session, deliveryForm]);

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
    if (session) {
      fetchCart();
    }
  }, [session]);

  const calculateSubtotal = (items: CartItem[]) => {
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setSubtotal(total);
  };

  const handleCreateOrder = async (deliveryData: DeliveryInfo) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deliveryInfo: deliveryData,
          items: cartItems.map((item) => ({
            itemId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
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

  const onSubmitDelivery = (data: DeliveryInfo) => {
    handleCreateOrder(data);
  };

  const handleRemoveItem = async (itemId: string) => {
    setUpdateLoading(itemId);
    try {
      const response = await fetch(`/api/cart?itemId=${itemId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        fetchCart();
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
        fetchCart();
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
    <div className="p-4 max-w-7xl mx-auto">
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
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items Section */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg shadow-sm p-4 border dark:border-border dark:shadow-none overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 dark:bg-muted/10 hover:bg-muted/40 dark:hover:bg-muted/20">
                    <TableHead className="text-accent font-bold">
                      Product
                    </TableHead>
                    <TableHead className="text-accent font-bold">
                      Price
                    </TableHead>
                    <TableHead className="text-accent font-bold">
                      Details
                    </TableHead>
                    <TableHead className="text-accent font-bold">
                      Quantity
                    </TableHead>
                    <TableHead className="text-accent font-bold">
                      Total
                    </TableHead>
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
                        <TableCell>{item.price.toFixed(2)} €</TableCell>
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
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className={`
                                h-8 w-8
                                border-accent
                                text-accent
                                hover:bg-accent hover:text-accent-foreground
                                dark:border-accent dark:text-accent dark:hover:bg-accent dark:hover:text-accent-foreground
                                transition-all
                              `}
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
                              className={`
                                h-8 w-8
                                border-accent
                                text-accent
                                hover:bg-accent hover:text-accent-foreground
                                dark:border-accent dark:text-accent dark:hover:bg-accent dark:hover:text-accent-foreground
                                transition-all
                              `}
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
                          {(item.price * item.quantity).toFixed(2)} €
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`
                              text-red-500
                              hover:text-white hover:bg-red-500
                              dark:text-red-400 dark:hover:bg-red-900
                              transition-colors
                            `}
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
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    className={`
                      border-2 border-primary
                      text-primary
                      hover:bg-primary/10
                      dark:border-primary dark:text-primary dark:hover:bg-primary/20
                      transition-colors
                    `}
                    onClick={() => router.push("/")}
                  >
                    Continue Shopping
                  </Button>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      Subtotal: {subtotal.toFixed(2)} €
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Taxes and shipping calculated at checkout
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Section */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-accent" />
                  <CardTitle>Checkout</CardTitle>
                </div>
                <CardDescription>
                  Enter your delivery information to complete the order
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...deliveryForm}>
                  <form
                    onSubmit={deliveryForm.handleSubmit(onSubmitDelivery)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={deliveryForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={deliveryForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={deliveryForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+33 1 23 45 67 89" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={deliveryForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="123 Main Street, Apartment 4B"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={deliveryForm.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="Paris" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={deliveryForm.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input placeholder="75001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={deliveryForm.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input placeholder="France" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="pt-4 border-t">
                      <div className="flex justify-between mb-4">
                        <span className="text-lg font-semibold">Total:</span>
                        <span className="text-lg font-bold">
                          {subtotal.toFixed(2)} €
                        </span>
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoading || cartItems.length === 0}
                        className={`
                          w-full
                          bg-accent
                          text-accent-foreground
                          hover:bg-accent/90
                          transition-colors
                          dark:bg-accent dark:text-accent-foreground dark:hover:bg-accent/90
                          disabled:opacity-50 disabled:cursor-not-allowed 
                          flex items-center justify-center gap-2
                        `}
                        size="lg"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            Complete Order <ArrowRight size={16} />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
