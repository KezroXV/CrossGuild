import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Mettre à jour un article spécifique du panier
export async function PATCH(
  req: Request,
  { params }: { params: { itemId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { itemId } = params;
    const { quantity } = await req.json();

    if (!itemId) {
      return NextResponse.json(
        { error: "L'ID de l'article est requis" },
        { status: 400 }
      );
    }

    // Vérifier que l'article appartient au panier de l'utilisateur
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: { cartItems: true }, // Correction ici: "items" -> "cartItems"
    });

    const cartItem = cart?.cartItems.find((item) => item.id === itemId); // Correction ici: "items" -> "cartItems"

    if (!cartItem) {
      return NextResponse.json(
        { error: "Article non trouvé dans le panier" },
        { status: 404 }
      );
    }

    // Mettre à jour la quantité
    await prisma.item.update({
      where: { id: itemId },
      data: { quantity },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CART_ITEM_PATCH]", error);
    return NextResponse.json(
      { error: "Échec de la mise à jour", success: false },
      { status: 500 }
    );
  }
}

// Supprimer un article spécifique du panier
export async function DELETE(
  req: Request,
  { params }: { params: { itemId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { itemId } = params;

    if (!itemId) {
      return NextResponse.json(
        { error: "L'ID de l'article est requis" },
        { status: 400 }
      );
    }

    // Vérifier que l'article appartient au panier de l'utilisateur
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: { cartItems: true }, // Correction ici: "items" -> "cartItems"
    });

    const cartItem = cart?.cartItems.find((item) => item.id === itemId); // Correction ici: "items" -> "cartItems"

    if (!cartItem) {
      return NextResponse.json(
        { error: "Article non trouvé dans le panier" },
        { status: 404 }
      );
    }

    // Supprimer l'article
    await prisma.item.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CART_ITEM_DELETE]", error);
    return NextResponse.json(
      { error: "Échec de la suppression", success: false },
      { status: 500 }
    );
  }
}
