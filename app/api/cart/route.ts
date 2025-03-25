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
        cartId: cart.id,
        categoryId: originalItem.categoryId,
        brandId: originalItem.brandId,
      },
    });

    // Copier les options de l'article
    if (options.length > 0) {
      await Promise.all(
        options.map(async (option: { optionId: string; value: string }) => {
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
