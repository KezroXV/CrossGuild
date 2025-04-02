"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addToCart(data: {
  itemId: string;
  quantity: number;
  options?: Array<{ optionId: string; value: string }>;
}) {
  try {
    const session = await auth();

    if (!session?.user) {
      return { error: "Non autorisé", success: false };
    }

    const { itemId, quantity = 1, options = [] } = data;

    if (!itemId) {
      return { error: "L'ID de l'article est requis", success: false };
    }

    // Vérifier si l'article existe
    const originalItem = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        images: true,
        options: true,
      },
    });

    if (!originalItem) {
      return { error: "Article non trouvé", success: false };
    }

    // Récupérer ou créer le panier
    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.user.id },
      });
    }

    // Créer une copie de l'article pour le panier
    const cartItem = await prisma.item.create({
      data: {
        name: originalItem.name,
        price: originalItem.price,
        quantity,
        description: originalItem.description,
        sku: `${originalItem.sku || "item"}-cart-${Date.now()}`,
        slug: `${originalItem.slug}-cart-${Date.now()}`,
        isPublished: true,
        categoryId: originalItem.categoryId,
        brandId: originalItem.brandId,
      },
    });

    // Créer la relation entre l'article et le panier via CartItem
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        itemId: cartItem.id,
        quantity,
      },
    });

    // Copier les options de l'article
    if (options.length > 0) {
      await Promise.all(
        options.map(async (option) => {
          await prisma.itemOption.create({
            data: {
              name:
                originalItem.options.find((o) => o.id === option.optionId)
                  ?.name || "Option",
              values: [option.value],
              itemId: cartItem.id,
            },
          });
        })
      );
    }

    // Copier les images de l'article
    if (originalItem.images.length > 0) {
      await Promise.all(
        originalItem.images.map(async (image) => {
          await prisma.image.create({
            data: {
              url: image.url,
              itemId: cartItem.id,
            },
          });
        })
      );
    }

    // Revalider le chemin du panier
    revalidatePath("/cart");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[ADD_TO_CART]", error);
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

    const { itemId, quantity } = data;

    if (!itemId) {
      return { error: "L'ID de l'article est requis", success: false };
    }

    // Vérifier que l'article appartient au panier de l'utilisateur
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: { cartItems: { include: { item: true } } },
    });

    const cartItemRelation = cart?.cartItems.find((ci) => ci.itemId === itemId);

    if (!cartItemRelation) {
      return { error: "Article non trouvé dans le panier", success: false };
    }

    // Mettre à jour la quantité
    await prisma.item.update({
      where: { id: itemId },
      data: { quantity },
    });

    // Revalider le chemin du panier
    revalidatePath("/cart");

    return { success: true };
  } catch (error) {
    console.error("[UPDATE_CART_ITEM]", error);
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

    if (!itemId) {
      return { error: "L'ID de l'article est requis", success: false };
    }

    // Vérifier que l'article appartient au panier de l'utilisateur
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: { cartItems: { include: { item: true } } },
    });

    const cartItemRelation = cart?.cartItems.find((ci) => ci.itemId === itemId);

    if (!cartItemRelation) {
      return { error: "Article non trouvé dans le panier", success: false };
    }

    // Supprimer l'article
    await prisma.item.delete({
      where: { id: itemId },
    });

    // Revalider le chemin du panier
    revalidatePath("/cart");

    return { success: true };
  } catch (error) {
    console.error("[REMOVE_FROM_CART]", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Échec de la suppression de l'article",
      success: false,
    };
  }
}
