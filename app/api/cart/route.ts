import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Récupérer simultanément le panier et les informations de l'utilisateur
    const [cart, user] = await Promise.all([
      prisma.cart.findUnique({
        where: { userId: session.user.id as string },
        include: {
          cartItems: {
            include: {
              item: {
                include: {
                  images: true,
                  options: true,
                },
              },
            },
          },
        },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id as string },
        select: { city: true },
      }),
    ]);

    if (!cart) {
      return NextResponse.json({ items: [] });
    }

    // Même méthode de formatage, mais avec city ajouté
    const items = cart.cartItems.map((cartItem) => {
      const { item, quantity } = cartItem;
      return {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity,
        images: item.images,
        options: item.options,
        city: user?.city || null, // Ajout du champ city
      };
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Failed to fetch cart:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { itemId, quantity } = body;

    if (!itemId) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    // Vérification de l'existence de l'article
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Recherche ou création du panier pour l'utilisateur
    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id as string },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: session.user.id as string,
        },
      });
    }

    // Recherche de l'élément de panier existant
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        cartId_itemId: {
          cartId: cart.id,
          itemId: itemId,
        },
      },
    });

    if (existingCartItem) {
      // Mise à jour de la quantité si l'élément est déjà dans le panier
      await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + (quantity || 1) },
      });
    } else {
      // Ajout d'un nouvel élément au panier
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          itemId: itemId,
          quantity: quantity || 1,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id as string },
    });

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    await prisma.cartItem.delete({
      where: {
        cartId_itemId: {
          cartId: cart.id,
          itemId: itemId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { itemId, quantity } = body;

    if (!itemId || !quantity) {
      return NextResponse.json(
        { error: "Item ID and quantity are required" },
        { status: 400 }
      );
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id as string },
    });

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    await prisma.cartItem.update({
      where: {
        cartId_itemId: {
          cartId: cart.id,
          itemId: itemId,
        },
      },
      data: { quantity },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating cart item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
