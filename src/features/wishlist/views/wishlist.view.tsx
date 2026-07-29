"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { LoadingState } from "@/shared/components/ui/loading-state";
import { WishlistGrid } from "@/features/wishlist/components/wishlist-grid.component";
import { useWishlist } from "@/features/wishlist/hooks/use-wishlist.hook";

export default function WishlistView() {
  const router = useRouter();
  const { status } = useSession();
  const {
    items,
    isLoading,
    isAuthenticated,
    removeItem,
    addToCart,
    actionLoadingItemId,
  } = useWishlist();

  if (status === "loading" || (isAuthenticated && isLoading)) {
    return (
      <LoadingState type="product-list" title="Loading your wishlist..." />
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 pt-28">
        <div className="max-w-6xl mx-auto text-center py-12 bg-muted/50 rounded-lg dark:bg-muted/10 border dark:border-border">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl mb-4">Sign in to view your wishlist</p>
          <Button
            onClick={() => router.push("/login?callbackUrl=/wishlist")}
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
      <div className="p-4 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold mb-2">Your Wishlist</h1>
          <p className="text-muted-foreground">
            {items.length} items saved for later
          </p>
        </motion.div>

        <WishlistGrid
          items={items}
          actionLoadingItemId={actionLoadingItemId}
          onRemoveItem={removeItem}
          onAddToCart={(itemId) => addToCart({ itemId })}
        />
      </div>
    </div>
  );
}
