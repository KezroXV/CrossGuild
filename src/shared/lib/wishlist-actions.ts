"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/shared/lib/auth";
import {
  addItem,
  removeItem,
} from "@/features/wishlist/server/wishlist.server";
import { NotFoundError } from "@/shared/lib/handle-api-error";

export async function addToWishlist(itemId: string) {
  try {
    const session = await auth();

    if (!session?.user) {
      return { error: "Non autorisé", success: false };
    }

    if (!itemId) {
      return { error: "L'ID de l'article est requis", success: false };
    }

    const result = await addItem(session.user.id, itemId);

    revalidatePath("/wishlist");

    if (result.alreadyExists) {
      return {
        message: "L'article est déjà dans votre liste de souhaits",
        success: true,
      };
    }

    return {
      message: "Article ajouté à votre liste de souhaits",
      success: true,
    };
  } catch (error) {
    console.error("[ADD_TO_WISHLIST]", error);

    if (error instanceof NotFoundError) {
      return { error: error.message, success: false };
    }

    return {
      error:
        error instanceof Error
          ? error.message
          : "Échec de l'ajout à la liste de souhaits",
      success: false,
    };
  }
}

export async function removeFromWishlist(itemId: string) {
  try {
    const session = await auth();

    if (!session?.user) {
      return { error: "Non autorisé", success: false };
    }

    if (!itemId) {
      return { error: "L'ID de l'article est requis", success: false };
    }

    await removeItem(session.user.id, itemId);

    revalidatePath("/wishlist");

    return {
      message: "Article supprimé de votre liste de souhaits",
      success: true,
    };
  } catch (error) {
    console.error("[REMOVE_FROM_WISHLIST]", error);

    if (error instanceof NotFoundError) {
      return { error: error.message, success: false };
    }

    return {
      error:
        error instanceof Error
          ? error.message
          : "Échec de la suppression de l'article de la liste de souhaits",
      success: false,
    };
  }
}
