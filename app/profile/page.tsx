/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Home } from "lucide-react"; // Import Home icon
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import Image from "next/image";
// Form schemas
const personalInfoSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  city: z.string().optional(), // Add city field
});

const passwordChangeSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type Order = {
  id: string;
  orderNumber: string;
  createdAt: string;
  totalAmount: number;
  status:
    | "PENDING"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "cancelled"
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";

  items: any[];
};

export default function ProfilePage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab =
    searchParams?.get("tab") === "orders" ? "orders" : "personal-info";

  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedOrderForCancel, setSelectedOrderForCancel] =
    useState<Order | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  // Personal info form
  const personalInfoForm = useForm<z.infer<typeof personalInfoSchema>>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      city: "", // Add city field to the form
    },
  });

  // Password change form
  const passwordChangeForm = useForm<z.infer<typeof passwordChangeSchema>>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Load user data
  useEffect(() => {
    if (session?.user) {
      personalInfoForm.reset({
        name: session.user.name || "",
        email: session.user.email || "",
        phone: "", // Removed session.user?.phone as it does not exist on the type
        city: (session.user as any).city || "", // Reset city field
      });

      fetchOrders(1);
    }
  }, [session]);

  // Fetch orders
  const fetchOrders = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `/api/user/orders?page=${page}&pageSize=5`
      );
      setOrders(response.data.orders);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to fetch your orders");
    } finally {
      setIsLoading(false);
    }
  };

  // Update personal info with image
  const onPersonalInfoSubmit = async (
    values: z.infer<typeof personalInfoSchema>
  ) => {
    try {
      // Update textual info
      const response = await axios.put("/api/user/profile", values);

      if (response.data.success) {
        // Update the form with the new values
        personalInfoForm.reset({
          name: values.name,
          email: values.email,
          phone: values.phone || "",
          city: values.city || "", // Reset city field
        });

        // Update session data to reflect changes immediately
        await updateSession({
          ...session,
          user: {
            ...session?.user,
            name: values.name,
            email: values.email,
            phone: values.phone,
            city: values.city, // Include city
          },
        });

        // Store city in sessionStorage for use in cart
        if (values.city) {
          sessionStorage.setItem("userCity", values.city);
        }
      }

      // If an image is selected, upload it
      if (image) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("image", image);

        const imageResponse = await axios.post(
          "/api/user/profile/image",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (imageResponse.data.success && imageResponse.data.imageUrl) {
          // Update session with new image URL
          await updateSession({
            ...session,
            user: {
              ...session?.user,
              image: imageResponse.data.imageUrl,
            },
          });

          // Explicitly update the UI with the new image URL
          setImagePreview(imageResponse.data.imageUrl);

          // Force a session refresh to ensure the UI updates
          // This makes sure the image actually updates in the UI
          const updatedSession = await updateSession();
          console.log("Session updated with new image:", updatedSession);
        } else {
          throw new Error("Image upload failed");
        }
      }

      toast.success("Your information has been updated");

      // Reset image state
      setImage(null);

      // Don't reset the imagePreview if we just set it to the new image URL
      if (!image) {
        setImagePreview(null);
      }

      setIsUploading(false);

      // No need to reload the page anymore
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update your information");
      setIsUploading(false);
    }
  };

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image is too large. Max size: 5MB.");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Selected file is not an image");
      return;
    }

    setImage(file);

    // Create image preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Trigger file input click
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Change password
  const onPasswordChangeSubmit = async (
    values: z.infer<typeof passwordChangeSchema>
  ) => {
    try {
      await axios.put("/api/user/password", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      toast.success("Your password has been updated");

      passwordChangeForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Failed to change password:", error);
      toast.error(
        "Failed to change your password. Please check your current password."
      );
    }
  };

  // View order details
  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
  };

  // Open cancel dialog
  const openCancelDialog = (order: Order) => {
    setSelectedOrderForCancel(order);
    setIsCancelDialogOpen(true);
  };

  // Cancel order
  const handleCancelOrder = async () => {
    if (!selectedOrderForCancel) return;

    try {
      const response = await axios.put(
        `/api/user/orders/${selectedOrderForCancel.id}/cancel`
      );

      if (response.data.success) {
        toast.success("Order cancelled successfully");

        // Update the order status in the local state
        setOrders(
          orders.map((order) =>
            order.id === selectedOrderForCancel.id
              ? { ...order, status: "cancelled" }
              : order
          )
        );

        // If the selected order is the one being displayed in the details dialog, update it
        if (selectedOrder && selectedOrder.id === selectedOrderForCancel.id) {
          setSelectedOrder({ ...selectedOrder, status: "cancelled" });
        }
      }
    } catch (error) {
      console.error("Failed to cancel order:", error);
      toast.error("Failed to cancel the order");
    } finally {
      setIsCancelDialogOpen(false);
      setSelectedOrderForCancel(null);
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    // Normalize status to uppercase for consistent comparison
    const normalizedStatus = status.toUpperCase();

    switch (normalizedStatus) {
      case "PENDING":
        return <Badge variant="outline">Pending</Badge>;
      case "PROCESSING":
        return <Badge variant="secondary">Processing</Badge>;
      case "SHIPPED":
        return <Badge variant="default">Shipped</Badge>;
      case "DELIVERED":
        return <Badge variant="default">Delivered</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format number with fallback
  const safelyFormatNumber = (value: number | undefined | null): string => {
    return value !== undefined && value !== null ? value.toFixed(2) : "0.00";
  };

  if (status === "loading") {
    return <div className="container mx-auto py-10">Loading...</div>;
  }

  return (
    <div className="pt-px min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col gap-8">
        <div className="container mx-auto py-10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">My Profile</h1>
            <Link href="/">
              <Button variant="outline" className="flex gap-2 items-center">
                <Home size={18} />
                <span>Home</span>
              </Button>
            </Link>
          </div>

          <Tabs defaultValue={defaultTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="personal-info">
                Personal Information
              </TabsTrigger>
              <TabsTrigger value="orders">My Orders</TabsTrigger>
            </TabsList>

            <TabsContent value="personal-info" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your profile information and photo here.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...personalInfoForm}>
                    <form
                      onSubmit={personalInfoForm.handleSubmit(
                        onPersonalInfoSubmit
                      )}
                      className="space-y-6"
                    >
                      {/* Profile Photo */}
                      <div className="flex flex-col items-center space-y-4 mb-6">
                        {" "}
                        <div className="relative h-24 w-24 rounded-full overflow-hidden border">
                          <Image
                            src={
                              imagePreview ||
                              session?.user?.image ||
                              "/images/default-avatar.svg"
                            }
                            alt="Avatar"
                            width={96}
                            height={96}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              if (target.src !== "/images/default-avatar.svg") {
                                target.src = "/images/default-avatar.svg";
                              }
                            }}
                          />
                        </div>
                        <div className="flex flex-col items-center space-y-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleButtonClick}
                          >
                            Choose Image
                          </Button>
                          <input
                            ref={fileInputRef}
                            id="profile-image"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                            disabled={isUploading}
                          />
                          {image && (
                            <p className="text-sm text-green-600">
                              New image selected
                            </p>
                          )}
                          {isUploading && (
                            <p className="text-sm text-muted-foreground">
                              Uploading...
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Max size: 5MB. Supported formats: JPG, PNG, GIF,
                            WEBP
                          </p>
                        </div>
                      </div>

                      {/* Personal info fields */}
                      <FormField
                        control={personalInfoForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={personalInfoForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input placeholder="your@email.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              Changing your email might require verification.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={personalInfoForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Your phone number"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={personalInfoForm.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City (optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Your city" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" disabled={isUploading}>
                        {isUploading ? "Updating..." : "Update Profile"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Make sure to use a secure password.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...passwordChangeForm}>
                    <form
                      onSubmit={passwordChangeForm.handleSubmit(
                        onPasswordChangeSubmit
                      )}
                      className="space-y-4"
                    >
                      <FormField
                        control={passwordChangeForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Your current password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordChangeForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Your new password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordChangeForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Confirm your new password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit">Change Password</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
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
                      You don&apos;t have any orders yet. yet.
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
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
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
                                  ? new Date(
                                      order.createdAt
                                    ).toLocaleDateString()
                                  : "N/A"}{" "}
                              </TableCell>
                              <TableCell>
                                {safelyFormatNumber(order.totalAmount)} €
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(order.status || "")}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openOrderDetails(order)}
                                  >
                                    View
                                  </Button>
                                  {(order.status.toUpperCase() === "PENDING" ||
                                    order.status.toUpperCase() ===
                                      "PROCESSING") && (
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => openCancelDialog(order)}
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
                                    fetchOrders(currentPage - 1);
                                  }}
                                />
                              </PaginationItem>
                            )}

                            {Array.from(
                              { length: totalPages },
                              (_, i) => i + 1
                            ).map((page) => (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  href="#"
                                  isActive={page === currentPage}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    fetchOrders(page);
                                  }}
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            ))}

                            {currentPage < totalPages && (
                              <PaginationItem>
                                <PaginationNext
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    fetchOrders(currentPage + 1);
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
            </TabsContent>
          </Tabs>
        </div>

        {/* Add Dialog for Order Details */}
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
                      {getStatusBadge(selectedOrder.status)}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Amount{" "}
                    </p>
                    <p className="font-medium">
                      {safelyFormatNumber(selectedOrder.totalAmount)} €
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
                      {selectedOrder.items && selectedOrder.items.length > 0 ? (
                        selectedOrder.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {item.product?.name ||
                                item.name ||
                                "Unknown Product"}
                            </TableCell>
                            <TableCell>{item.quantity || 1}</TableCell>{" "}
                            <TableCell>
                              {safelyFormatNumber(
                                item.price || item.unitPrice || 0
                              )}{" "}
                              €
                            </TableCell>
                            <TableCell className="text-right">
                              {safelyFormatNumber(
                                (item.price || item.unitPrice || 0) *
                                  (item.quantity || 1)
                              )}{" "}
                              €
                            </TableCell>
                          </TableRow>
                        ))
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
                  {(selectedOrder.status.toUpperCase() === "PENDING" ||
                    selectedOrder.status.toUpperCase() === "PROCESSING") && (
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setIsOrderDetailsOpen(false);
                        openCancelDialog(selectedOrder);
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

        {/* Add Cancel Order Dialog */}
        <AlertDialog
          open={isCancelDialogOpen}
          onOpenChange={setIsCancelDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Order</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this order? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No, keep order</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancelOrder}>
                Yes, cancel order
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
