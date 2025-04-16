"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addToWishlist(itemId: string) {
  try {
    const session = await auth();

    if (!session?.user) {
      return { error: "Non autorisé", success: false };
    }

    if (!itemId) {
      return { error: "L'ID de l'article est requis", success: false };
    }

    // Vérifier si l'article existe
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return { error: "Article non trouvé", success: false };
    }

    // Vérifier si l'article est déjà dans la liste de souhaits
    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_itemId: {
          userId: session.user.id,
          itemId,
        },
      },
    });

    if (existingItem) {
      return {
        message: "L'article est déjà dans votre liste de souhaits",
        success: true,
      };
    }

    // Ajouter l'article à la liste de souhaits
    await prisma.wishlistItem.create({
      data: {
        userId: session.user.id,
        itemId,
      },
    });

    // Revalider le chemin
    revalidatePath("/wishlist");

    return {
      message: "Article ajouté à votre liste de souhaits",
      success: true,
    };
  } catch (error) {
    console.error("[ADD_TO_WISHLIST]", error);
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

    // Supprimer l'article de la liste de souhaits
    await prisma.wishlistItem.delete({
      where: {
        userId_itemId: {
          userId: session.user.id,
          itemId,
        },
      },
    });

    // Revalider le chemin
    revalidatePath("/wishlist");

    return {
      message: "Article supprimé de votre liste de souhaits",
      success: true,
    };
  } catch (error) {
    console.error("[REMOVE_FROM_WISHLIST]", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Échec de la suppression de l'article de la liste de souhaits",
      success: false,
    };
  }
}
