"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
// Use Sonner for toast notifications
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";

// Form schemas
const personalInfoSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
});

const passwordChangeSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    newPassword: z
      .string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    confirmPassword: z
      .string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type Order = {
  id: string;
  orderNumber: string;
  createdAt: string;
  totalAmount: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  items: any[];
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  // Remove useToast hook

  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);

  // Personal Info Form
  const personalInfoForm = useForm<z.infer<typeof personalInfoSchema>>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  // Password Change Form
  const passwordChangeForm = useForm<z.infer<typeof passwordChangeSchema>>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Redirect if not logged in
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
        phone: session.user.phone || "",
      });

      fetchOrders(1);
    }
  }, [session]);

  // Fetch user orders
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
      // Use Sonner toast for error notifications
      toast.error("Impossible de récupérer vos commandes");
    } finally {
      setIsLoading(false);
    }
  };

  // Update personal info
  const onPersonalInfoSubmit = async (
    values: z.infer<typeof personalInfoSchema>
  ) => {
    try {
      await axios.put("/api/user/profile", values);
      // Use Sonner toast for success notifications
      toast.success("Vos informations ont été mises à jour");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Impossible de mettre à jour vos informations");
    }
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

      toast.success("Votre mot de passe a été mis à jour");

      passwordChangeForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Failed to change password:", error);
      toast.error(
        "Impossible de changer votre mot de passe. Vérifiez que votre mot de passe actuel est correct."
      );
    }
  };

  // View order details
  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline">En attente</Badge>;
      case "PROCESSING":
        return <Badge variant="secondary">En cours</Badge>;
      case "SHIPPED":
        return <Badge variant="default">Expédiée</Badge>;
      case "DELIVERED":
        return <Badge variant="success">Livrée</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Annulée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Safely format number with fallback
  const safelyFormatNumber = (value: number | undefined | null): string => {
    return value !== undefined && value !== null ? value.toFixed(2) : "0.00";
  };

  if (status === "loading") {
    return <div className="container mx-auto py-10">Chargement...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Mon Profil</h1>

      <Tabs defaultValue="personal-info" className="space-y-6">
        <TabsList>
          <TabsTrigger value="personal-info">
            Informations Personnelles
          </TabsTrigger>
          <TabsTrigger value="orders">Mes Commandes</TabsTrigger>
        </TabsList>

        <TabsContent value="personal-info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations Personnelles</CardTitle>
              <CardDescription>
                Mettez à jour vos informations personnelles ici.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...personalInfoForm}>
                <form
                  onSubmit={personalInfoForm.handleSubmit(onPersonalInfoSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={personalInfoForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom & Prénom</FormLabel>
                        <FormControl>
                          <Input placeholder="Votre nom complet" {...field} />
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
                        <FormLabel>Adresse e-mail</FormLabel>
                        <FormControl>
                          <Input placeholder="votre@email.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          La modification de l'email peut nécessiter une
                          vérification.
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
                        <FormLabel>Numéro de téléphone (optionnel)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Votre numéro de téléphone"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit">Mettre à jour mes informations</Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Modifier mon mot de passe</CardTitle>
              <CardDescription>
                Assurez-vous d'utiliser un mot de passe sécurisé.
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
                        <FormLabel>Mot de passe actuel</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Votre mot de passe actuel"
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
                        <FormLabel>Nouveau mot de passe</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Votre nouveau mot de passe"
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
                        <FormLabel>Confirmer le nouveau mot de passe</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Confirmez votre nouveau mot de passe"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit">Changer mon mot de passe</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Historique des commandes</CardTitle>
              <CardDescription>
                Consultez toutes vos commandes passées.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-6">
                  Chargement des commandes...
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-6">
                  Vous n'avez pas encore de commandes.
                </div>
              ) : (
                <>
                  <Table>
                    <TableCaption>Liste de vos commandes</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Numéro de commande</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Statut</TableHead>
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
                            {safelyFormatNumber(order.totalAmount)} €
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(order.status || "")}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openOrderDetails(order)}
                            >
                              Voir détails
                            </Button>
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

      {/* Order Details Dialog */}
      <Dialog open={isOrderDetailsOpen} onOpenChange={setIsOrderDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Détails de la commande {selectedOrder?.orderNumber || "N/A"}
            </DialogTitle>
            <DialogDescription>
              Commande passée le{" "}
              {selectedOrder?.createdAt
                ? new Date(selectedOrder.createdAt).toLocaleDateString()
                : "N/A"}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Status: {getStatusBadge(selectedOrder.status || "")}
                  </p>
                </div>
                <div>
                  <p className="font-medium">
                    Total: {safelyFormatNumber(selectedOrder.totalAmount)} €
                  </p>
                </div>
              </div>

              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead className="text-right">Quantité</TableHead>
                      <TableHead className="text-right">Prix</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item?.name || "N/A"}</TableCell>
                          <TableCell className="text-right">
                            {item?.quantity || 0}
                          </TableCell>
                          <TableCell className="text-right">
                            {safelyFormatNumber(item?.price)} €
                          </TableCell>
                          <TableCell className="text-right">
                            {safelyFormatNumber(
                              item?.price && item?.quantity
                                ? item.price * item.quantity
                                : 0
                            )}{" "}
                            €
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          Aucun produit trouvé
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
