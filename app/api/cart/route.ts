import prisma from "@/lib/prisma";
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
        cartItems: {
          include: {
            item: {
              include: {
                images: true,
                category: true,
                brand: true,
                options: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.user.id },
        include: {
          cartItems: {
            include: {
              item: {
                include: {
                  images: true,
                  category: true,
                  brand: true,
                  options: true,
                },
              },
            },
          },
        },
      });
    }

    // Format the response to match the expected structure by the client
    const formattedCart = {
      ...cart,
      items: cart.cartItems.map((cartItem) => ({
        ...cartItem.item,
        quantity: cartItem.quantity,
        cartItemId: cartItem.id,
      })),
    };

    return NextResponse.json(formattedCart);
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
      return NextResponse.json(
        { error: "Non autorisé", success: false },
        { status: 401 }
      );
    }

    const { itemId, quantity = 1 } = await req.json();

    if (!itemId) {
      return NextResponse.json(
        { error: "L'ID de l'article est requis", success: false },
        { status: 400 }
      );
    }

    // Vérifier si l'article existe
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        images: true,
        category: true,
        brand: true,
        options: true,
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Article non trouvé", success: false },
        { status: 404 }
      );
    }

    // Récupérer ou créer le panier
    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        cartItems: true,
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.user.id },
        include: {
          cartItems: true,
        },
      });
    }

    // Vérifier si cet article est déjà dans le panier
    const existingCartItem = cart.cartItems.find(
      (cartItem) => cartItem.itemId === itemId
    );

    // Si l'article existe déjà, augmenter la quantité
    if (existingCartItem) {
      await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + quantity,
        },
      });
    } else {
      // Sinon, ajouter l'article au panier
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          itemId: item.id,
          quantity,
        },
      });
    }

    // Récupérer le panier mis à jour
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        cartItems: {
          include: {
            item: {
              include: {
                images: true,
                category: true,
                brand: true,
                options: true,
              },
            },
          },
        },
      },
    });

    // Format the response to match the expected structure by the client
    const formattedCart = {
      ...updatedCart,
      items: updatedCart?.cartItems.map((cartItem) => ({
        ...cartItem.item,
        quantity: cartItem.quantity,
        cartItemId: cartItem.id,
      })),
    };

    return NextResponse.json({ cart: formattedCart, success: true });
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
      return NextResponse.json(
        { error: "Non autorisé", success: false },
        { status: 401 }
      );
    }

    const { itemId, quantity } = await req.json();

    if (!itemId) {
      return NextResponse.json(
        { error: "L'ID de l'article est requis", success: false },
        { status: 400 }
      );
    }

    // Récupérer le panier
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: { cartItems: true },
    });

    if (!cart) {
      return NextResponse.json(
        { error: "Panier non trouvé", success: false },
        { status: 404 }
      );
    }

    // Trouver l'article dans le panier
    const cartItem = cart.cartItems.find((item) => item.itemId === itemId);

    if (!cartItem) {
      return NextResponse.json(
        { error: "Article non trouvé dans le panier", success: false },
        { status: 404 }
      );
    }

    // Mettre à jour la quantité
    await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity },
    });

    // Récupérer le panier mis à jour
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        cartItems: {
          include: {
            item: {
              include: {
                images: true,
                category: true,
                brand: true,
                options: true,
              },
            },
          },
        },
      },
    });

    // Format the response
    const formattedCart = {
      ...updatedCart,
      items:
        updatedCart?.cartItems.map((cartItem) => ({
          ...cartItem.item,
          quantity: cartItem.quantity,
          cartItemId: cartItem.id,
        })) || [],
    };

    return NextResponse.json({ cart: formattedCart, success: true });
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
      return NextResponse.json(
        { error: "Non autorisé", success: false },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        { error: "L'ID de l'article est requis", success: false },
        { status: 400 }
      );
    }

    // Récupérer le panier
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: { cartItems: true },
    });

    if (!cart) {
      return NextResponse.json(
        { error: "Panier non trouvé", success: false },
        { status: 404 }
      );
    }

    // Trouver l'article dans le panier
    const cartItem = cart.cartItems.find((item) => item.itemId === itemId);

    if (!cartItem) {
      return NextResponse.json(
        { error: "Article non trouvé dans le panier", success: false },
        { status: 404 }
      );
    }

    // Supprimer l'article du panier
    await prisma.cartItem.delete({
      where: { id: cartItem.id },
    });

    // Récupérer le panier mis à jour
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        cartItems: {
          include: {
            item: {
              include: {
                images: true,
                category: true,
                brand: true,
                options: true,
              },
            },
          },
        },
      },
    });

    // Format the response
    const formattedCart = {
      ...updatedCart,
      items:
        updatedCart?.cartItems.map((cartItem) => ({
          ...cartItem.item,
          quantity: cartItem.quantity,
          cartItemId: cartItem.id,
        })) || [],
    };

    return NextResponse.json({ cart: formattedCart, success: true });
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
