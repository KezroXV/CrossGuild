"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { CreditCard, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { LoadingState } from "@/shared/components/ui/loading-state";
import { CartItemsList } from "@/features/cart/components/cart-items-list.component";
import { CartSummary } from "@/features/cart/components/cart-summary.component";
import { DeliveryForm } from "@/features/cart/components/delivery-form.component";
import { useCart } from "@/features/cart/hooks/use-cart.hook";
import type { DeliveryInfo } from "@/features/cart/validations/cart.schema";

export default function CartView() {
  const router = useRouter();
  const { status } = useSession();
  const {
    items,
    subtotal,
    isLoading,
    isAuthenticated,
    updateQuantity,
    removeItem,
    checkout,
    isUpdating,
    isRemoving,
    isCheckingOut,
  } = useCart();

  const handleCheckout = async (deliveryInfo: DeliveryInfo) => {
    try {
      const data = await checkout(deliveryInfo);

      if (data.success) {
        router.push(`/order-confirmation?orderId=${data.order.id}`);
        toast.success("Order created successfully!");
      } else {
        toast.error(data.error || "Failed to create order");
      }
    } catch {
      toast.error("An error occurred while creating your order");
    }
  };

  if (status === "loading" || (isAuthenticated && isLoading)) {
    return <LoadingState type="cart" title="Loading your cart..." />;
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 pt-28">
        <div className="max-w-6xl mx-auto text-center py-12 bg-muted/50 rounded-lg dark:bg-muted/10 border dark:border-border">
          <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl mb-4">Sign in to view your cart</p>
          <Button
            onClick={() => router.push("/login?callbackUrl=/cart")}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            size="lg"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-28">
      <div className="max-w-6xl mx-auto p-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold mb-2">Your Cart</h1>
          <p className="text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"} in your cart
          </p>
        </motion.div>

        {items.length === 0 ? (
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
            <div className="lg:col-span-2">
              <CartItemsList
                items={items}
                updatingItemId={isUpdating}
                removingItemId={isRemoving}
                onUpdateQuantity={(itemId, quantity) =>
                  updateQuantity({ itemId, quantity })
                }
                onRemoveItem={removeItem}
              />
              <CartSummary subtotal={subtotal} />
            </div>

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
                  <DeliveryForm
                    subtotal={subtotal}
                    isSubmitting={isCheckingOut}
                    isDisabled={items.length === 0}
                    onSubmit={handleCheckout}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
