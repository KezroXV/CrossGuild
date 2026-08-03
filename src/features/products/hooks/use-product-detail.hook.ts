"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { addToCartItem } from "@/features/cart/services/cart.service";
import {
  checkWishlistItem,
  addWishlistItem,
  removeWishlistItem,
} from "@/features/wishlist/services/wishlist.service";
import type { ProductDetailItem } from "@/features/products/types/product.type";

export function useProductDetail(product: ProductDetailItem) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    {}
  );
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    if (product.options.length > 0) {
      const defaultOptions: Record<string, string> = {};
      product.options.forEach((option) => {
        if (option.values.length > 0) {
          defaultOptions[option.id] = option.values[0];
        }
      });
      setSelectedOptions(defaultOptions);
    }

    const checkWishlistStatus = async () => {
      try {
        const data = await checkWishlistItem(product.id);
        setIsInWishlist(data.inWishlist);
      } catch (error) {
        console.error("Error checking wishlist status:", error);
      }
    };

    checkWishlistStatus();
  }, [product.options, product.id]);

  const selectedOptionsPayload = Object.entries(selectedOptions).map(
    ([optionId, value]) => ({ optionId, value })
  );

  const handleOptionSelect = (optionId: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionId]: value }));
  };

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value > 0 && value <= product.quantity) {
      setQuantity(value);
    }
  };

  const addToCart = async () => {
    return addToCartItem(product.id, quantity, selectedOptionsPayload);
  };

  const handleAddToCart = async () => {
    if (product.quantity === 0) {
      toast.error("Ce produit est en rupture de stock");
      return;
    }

    try {
      setIsAddingToCart(true);
      await addToCart();
      toast.success(`${product.name} a été ajouté à votre panier`);
      startTransition(() => router.refresh());
    } catch (error) {
      console.error("Erreur lors de l'ajout au panier:", error);
      toast.error(
        error instanceof Error ? error.message : "Échec de l'ajout au panier"
      );
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (product.quantity === 0) {
      toast.error("Ce produit est en rupture de stock");
      return;
    }

    try {
      setIsAddingToCart(true);
      await addToCart();
      router.push("/cart");
    } catch (error) {
      console.error("Erreur lors de l'achat rapide:", error);
      toast.error(
        error instanceof Error ? error.message : "Échec de l'achat rapide"
      );
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    try {
      setIsAddingToWishlist(true);

      if (isInWishlist) {
        await removeWishlistItem(product.id);
      } else {
        await addWishlistItem(product.id);
      }

      setIsInWishlist(!isInWishlist);
      toast.success(
        isInWishlist
          ? `${product.name} removed from your wishlist`
          : `${product.name} added to your wishlist`
      );
      startTransition(() => router.refresh());
    } catch (error) {
      console.error(
        `Error ${isInWishlist ? "removing from" : "adding to"} wishlist:`,
        error
      );
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to ${isInWishlist ? "remove from" : "add to"} wishlist`
      );
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const averageRating =
    product.reviews && product.reviews.length > 0
      ? product.reviews.reduce((acc, review) => acc + review.rating, 0) /
        product.reviews.length
      : 0;

  return {
    quantity,
    setQuantity,
    selectedOptions,
    handleOptionSelect,
    handleQuantityChange,
    handleAddToCart,
    handleBuyNow,
    handleAddToWishlist,
    isAddingToCart,
    isAddingToWishlist,
    isInWishlist,
    isPending,
    averageRating,
  };
}
