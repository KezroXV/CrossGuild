import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Récupérer le panier de l'utilisateur
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer le panier existant ou en créer un nouveau
    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            images: true,
            category: true,
            brand: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.user.id },
        include: {
          items: {
            include: {
              images: true,
              category: true,
              brand: true,
            },
          },
        },
      });
    }

    return NextResponse.json(cart);
  } catch (error) {
    console.error("[CART_GET]", error);
    return NextResponse.json(
      { error: "Échec de la récupération du panier" },
      { status: 500 }
    );
  }
}

// Ajouter un produit au panier
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { itemId, quantity = 1, options = [] } = await req.json();

    if (!itemId) {
      return NextResponse.json(
        { error: "L'ID de l'article est requis" },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: "Article non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer ou créer le panier
    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: true,
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.user.id },
        include: {
          items: true,
        },
      });
    }

    // Vérifier si l'article est déjà dans le panier
    const existingCartItem = cart.items.find((item) =>
      item.sku?.includes(originalItem.sku || "")
    );

    let cartItem;

    if (existingCartItem) {
      // Si l'article existe déjà, mettre à jour la quantité
      cartItem = await prisma.item.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + quantity,
        },
      });
    } else {
      // Sinon, créer une référence au panier
      const cartRef = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          itemId: originalItem.id,
          quantity: quantity,
        },
      });

      // Renvoyer l'item original avec la quantité spécifiée pour le panier
      cartItem = {
        ...originalItem,
        cartQuantity: quantity,
      };
    }

    // Récupérer le panier mis à jour
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            images: true,
            category: true,
            brand: true,
            options: true,
          },
        },
      },
    });

    return NextResponse.json({ cart: updatedCart, success: true });
  } catch (error) {
    console.error("[CART_POST]", error);
    return NextResponse.json(
      { error: "Échec de l'ajout au panier", success: false },
      { status: 500 }
    );
  }
}

// Mettre à jour la quantité d'un article dans le panier
export async function PATCH(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { itemId, quantity } = await req.json();

    if (!itemId) {
      return NextResponse.json(
        { error: "L'ID de l'article est requis" },
        { status: 400 }
      );
    }

    // Vérifier que l'article appartient au panier de l'utilisateur
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: { items: true },
    });

    const cartItem = cart?.items.find((item) => item.id === itemId);

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

    // Récupérer le panier mis à jour
    const updatedCart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            images: true,
            category: true,
            brand: true,
          },
        },
      },
    });

    return NextResponse.json({ cart: updatedCart, success: true });
  } catch (error) {
    console.error("[CART_PATCH]", error);
    return NextResponse.json(
      { error: "Échec de la mise à jour du panier", success: false },
      { status: 500 }
    );
  }
}

// Supprimer un article du panier
export async function DELETE(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        { error: "L'ID de l'article est requis" },
        { status: 400 }
      );
    }

    // Vérifier que l'article appartient au panier de l'utilisateur
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: { items: true },
    });

    const cartItem = cart?.items.find((item) => item.id === itemId);

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

    // Récupérer le panier mis à jour
    const updatedCart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            images: true,
            category: true,
            brand: true,
          },
        },
      },
    });

    return NextResponse.json({ cart: updatedCart, success: true });
  } catch (error) {
    console.error("[CART_DELETE]", error);
    return NextResponse.json(
      {
        error: "Échec de la suppression de l'article du panier",
        success: false,
      },
      { status: 500 }
    );
  }
}
