"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/shared/lib/auth";
import {
  addToCart as addToCartServer,
  removeFromCart as removeFromCartServer,
  updateCartItem as updateCartItemServer,
} from "@/features/cart/server/cart.server";
import { NotFoundError } from "@/shared/lib/handle-api-error";

export async function addToCart(data: {
  itemId: string;
  quantity?: number;
}) {
  try {
    const session = await auth();

    if (!session?.user) {
      return { error: "Non autorisé", success: false };
    }

    await addToCartServer(
      session.user.id,
      data.itemId,
      data.quantity ?? 1
    );

    revalidatePath("/cart");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[ADD_TO_CART]", error);

    if (error instanceof NotFoundError) {
      return { error: error.message, success: false };
    }

    return {
      error:
        error instanceof Error ? error.message : "Échec de l'ajout au panier",
      success: false,
    };
  }
}

export async function updateCartItem(data: {
  itemId: string;
  quantity: number;
}) {
  try {
    const session = await auth();

    if (!session?.user) {
      return { error: "Non autorisé", success: false };
    }

    await updateCartItemServer(session.user.id, data.itemId, data.quantity);

    revalidatePath("/cart");

    return { success: true };
  } catch (error) {
    console.error("[UPDATE_CART_ITEM]", error);

    if (error instanceof NotFoundError) {
      return { error: error.message, success: false };
    }

    return {
      error:
        error instanceof Error
          ? error.message
          : "Échec de la mise à jour du panier",
      success: false,
    };
  }
}

export async function removeFromCart(itemId: string) {
  try {
    const session = await auth();

    if (!session?.user) {
      return { error: "Non autorisé", success: false };
    }

    await removeFromCartServer(session.user.id, itemId);

    revalidatePath("/cart");

    return { success: true };
  } catch (error) {
    console.error("[REMOVE_FROM_CART]", error);

    if (error instanceof NotFoundError) {
      return { error: error.message, success: false };
    }

    return {
      error:
        error instanceof Error
          ? error.message
          : "Échec de la suppression de l'article",
      success: false,
    };
  }
}
