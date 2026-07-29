"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ImageIcon, Minus, Plus, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import type { CartItem } from "@/features/cart/types/cart.type";

interface CartItemsListProps {
  items: CartItem[];
  updatingItemId: string | null;
  removingItemId: string | null;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
}

export function CartItemsList({
  items,
  updatingItemId,
  removingItemId,
  onUpdateQuantity,
  onRemoveItem,
}: CartItemsListProps) {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (itemId: string) => {
    setImageErrors((prev) => ({
      ...prev,
      [itemId]: true,
    }));
  };

  return (
    <div className="bg-card rounded-lg shadow-sm p-4 border dark:border-border dark:shadow-none overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 dark:bg-muted/10 hover:bg-muted/40 dark:hover:bg-muted/20">
            <TableHead className="text-accent font-bold">Product</TableHead>
            <TableHead className="text-accent font-bold">Price</TableHead>
            <TableHead className="text-accent font-bold">Details</TableHead>
            <TableHead className="text-accent font-bold">Quantity</TableHead>
            <TableHead className="text-accent font-bold">Total</TableHead>
            <TableHead className="text-accent font-bold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence>
            {items.map((item) => {
              const isUpdating =
                updatingItemId === item.id || removingItemId === item.id;

              return (
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
                        {!imageErrors[item.id] && item.images.length > 1 && (
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
                      <p key={idx} className="text-sm text-muted-foreground">
                        <span className="font-semibold">{option.name}:</span>{" "}
                        {option.values.join(", ")}
                      </p>
                    ))}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-accent text-accent hover:bg-accent hover:text-accent-foreground dark:border-accent dark:text-accent dark:hover:bg-accent dark:hover:text-accent-foreground transition-all"
                        onClick={() =>
                          onUpdateQuantity(
                            item.id,
                            Math.max(1, item.quantity - 1)
                          )
                        }
                        disabled={isUpdating}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-accent text-accent hover:bg-accent hover:text-accent-foreground dark:border-accent dark:text-accent dark:hover:bg-accent dark:hover:text-accent-foreground transition-all"
                        onClick={() =>
                          onUpdateQuantity(item.id, item.quantity + 1)
                        }
                        disabled={isUpdating}
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
                      className="text-red-500 hover:text-white hover:bg-red-500 dark:text-red-400 dark:hover:bg-red-900 transition-colors"
                      onClick={() => onRemoveItem(item.id)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                      ) : (
                        <Trash2 className="h-5 w-5" />
                      )}
                    </Button>
                  </TableCell>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
}
