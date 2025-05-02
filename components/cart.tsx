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
import { Select, SelectTrigger, SelectContent, SelectItem } from "./ui/select";

// Liste des 58 wilayas d'Algérie
const WILAYAS = [
  { code: "01", name: "Adrar" },
  { code: "02", name: "Chlef" },
  { code: "03", name: "Laghouat" },
  { code: "04", name: "Oum El Bouaghi" },
  { code: "05", name: "Batna" },
  { code: "06", name: "Béjaïa" },
  { code: "07", name: "Biskra" },
  { code: "08", name: "Béchar" },
  { code: "09", name: "Blida" },
  { code: "10", name: "Bouira" },
  { code: "11", name: "Tamanrasset" },
  { code: "12", name: "Tébessa" },
  { code: "13", name: "Tlemcen" },
  { code: "14", name: "Tiaret" },
  { code: "15", name: "Tizi Ouzou" },
  { code: "16", name: "Alger" },
  { code: "17", name: "Djelfa" },
  { code: "18", name: "Jijel" },
  { code: "19", name: "Sétif" },
  { code: "20", name: "Saïda" },
  { code: "21", name: "Skikda" },
  { code: "22", name: "Sidi Bel Abbès" },
  { code: "23", name: "Annaba" },
  { code: "24", name: "Guelma" },
  { code: "25", name: "Constantine" },
  { code: "26", name: "Médéa" },
  { code: "27", name: "Mostaganem" },
  { code: "28", name: "M'Sila" },
  { code: "29", name: "Mascara" },
  { code: "30", name: "Ouargla" },
  { code: "31", name: "Oran" },
  { code: "32", name: "El Bayadh" },
  { code: "33", name: "Illizi" },
  { code: "34", name: "Bordj Bou Arreridj" },
  { code: "35", name: "Boumerdès" },
  { code: "36", name: "El Tarf" },
  { code: "37", name: "Tindouf" },
  { code: "38", name: "Tissemsilt" },
  { code: "39", name: "El Oued" },
  { code: "40", name: "Khenchela" },
  { code: "41", name: "Souk Ahras" },
  { code: "42", name: "Tipaza" },
  { code: "43", name: "Mila" },
  { code: "44", name: "Aïn Defla" },
  { code: "45", name: "Naâma" },
  { code: "46", name: "Aïn Témouchent" },
  { code: "47", name: "Ghardaïa" },
  { code: "48", name: "Relizane" },
  { code: "49", name: "Timimoun" },
  { code: "50", name: "Bordj Badji Mokhtar" },
  { code: "51", name: "Ouled Djellal" },
  { code: "52", name: "Béni Abbès" },
  { code: "53", name: "In Salah" },
  { code: "54", name: "In Guezzam" },
  { code: "55", name: "Touggourt" },
  { code: "56", name: "Djanet" },
  { code: "57", name: "El M'Ghair" },
  { code: "58", name: "El Meniaa" },
];

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
  const [selectedCity, setSelectedCity] = useState<string>("");
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
    if (session) {
      fetchCart();
    }
  }, [session]);

  useEffect(() => {
    if (!selectedCity && (session?.user?.city || cartItems[0]?.city)) {
      setSelectedCity(session?.user?.city || cartItems[0]?.city || "");
    }
  }, [session, cartItems, selectedCity]);

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
      const city = selectedCity;

      if (!city) {
        toast.warning(
          "Veuillez sélectionner une ville de livraison avant de valider la commande"
        );
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          city,
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
                      <TableCell>{item.price.toFixed(2)} DA</TableCell>
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
                        <p className="text-sm">
                          {item.city || "City not set"}
                          {!item.city && (
                            <span className="text-xs text-red-500 block mt-1">
                              Please update your profile
                            </span>
                          )}
                        </p>
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
                        {(item.price * item.quantity).toFixed(2)} DA
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
              <div className="flex justify-end text-right mb-6">
                <div>
                  <p className="text-lg font-bold">
                    Subtotal: {subtotal.toFixed(2)} DA
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Taxes and shipping calculated at checkout
                  </p>
                  <div className="mt-4 flex flex-col items-start">
                    <label htmlFor="city" className="mb-1 font-medium">
                      Ville de livraison
                    </label>
                    <Select
                      value={selectedCity}
                      onValueChange={setSelectedCity}
                    >
                      <SelectTrigger className="w-64" id="city">
                        {selectedCity
                          ? WILAYAS.find((w) => w.name === selectedCity)
                              ?.name || selectedCity
                          : "Choisir une ville"}
                      </SelectTrigger>
                      <SelectContent>
                        {WILAYAS.map((wilaya) => (
                          <SelectItem key={wilaya.code} value={wilaya.name}>
                            {wilaya.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {!cartItems.some((item) => item.city) &&
                    !session?.user?.city && (
                      <p className="text-xs text-red-500 mt-2">
                        Your shipping city is not set. Please update your
                        profile before checkout.
                      </p>
                    )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-between mt-6 gap-4">
                <Button
                  variant="outline"
                  className={`
                    border-2 border-primary
                    text-primary
                    hover:bg-primary/10
                    dark:border-primary dark:text-primary dark:hover:bg-primary/20
                    transition-colors w-full sm:w-auto
                  `}
                  onClick={() => router.push("/")}
                >
                  Continue Shopping
                </Button>
                <div className="flex flex-col sm:flex-row gap-2">
                  {!cartItems.some((item) => item.city) &&
                    !session?.user?.city && (
                      <Button
                        variant="outline"
                        className={`
                          border border-accent
                          text-accent
                          hover:bg-accent/10
                          dark:border-accent dark:text-accent dark:hover:bg-accent/20
                          transition-colors w-full sm:w-auto
                        `}
                        onClick={() => router.push("/profile")}
                      >
                        Update Profile
                      </Button>
                    )}
                  <Button
                    onClick={handleCreateOrder}
                    disabled={
                      isLoading ||
                      cartItems.length === 0 ||
                      (!cartItems.some((item) => item.city) &&
                        !session?.user?.city)
                    }
                    className={`
                      bg-accent
                      text-accent-foreground
                      hover:bg-accent/90
                      transition-colors w-full sm:w-auto
                      dark:bg-accent dark:text-accent-foreground dark:hover:bg-accent/90
                      disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2
                    `}
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
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
