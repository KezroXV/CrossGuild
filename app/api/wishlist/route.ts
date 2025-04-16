import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Récupérer la liste de souhaits de l'utilisateur
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer les articles dans la liste de souhaits de l'utilisateur
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId: session.user.id },
      include: {
        item: {
          include: {
            images: true,
            category: true,
            brand: true,
          },
        },
      },
    });

    // Format the response
    const formattedWishlist = wishlistItems.map((wishlistItem) => ({
      ...wishlistItem.item,
      wishlistItemId: wishlistItem.id,
    }));

    return NextResponse.json({ items: formattedWishlist });
  } catch (error) {
    console.error("[WISHLIST_GET]", error);
    return NextResponse.json(
      { error: "Échec de la récupération de la liste de souhaits" },
      { status: 500 }
    );
  }
}

// Ajouter un produit à la liste de souhaits
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autorisé", success: false },
        { status: 401 }
      );
    }

    const { itemId } = await req.json();

    if (!itemId) {
      return NextResponse.json(
        { error: "L'ID de l'article est requis", success: false },
        { status: 400 }
      );
    }

    // Vérifier si l'article existe
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Article non trouvé", success: false },
        { status: 404 }
      );
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
      return NextResponse.json({
        message: "L'article est déjà dans votre liste de souhaits",
        success: true,
      });
    }

    // Ajouter l'article à la liste de souhaits
    await prisma.wishlistItem.create({
      data: {
        userId: session.user.id,
        itemId,
      },
    });

    return NextResponse.json({
      message: "Article ajouté à votre liste de souhaits",
      success: true,
    });
  } catch (error) {
    console.error("[WISHLIST_POST]", error);
    return NextResponse.json(
      {
        error: "Échec de l'ajout à la liste de souhaits",
        success: false,
      },
      { status: 500 }
    );
  }
}

// Supprimer un article de la liste de souhaits
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

    // Supprimer l'article de la liste de souhaits
    await prisma.wishlistItem.delete({
      where: {
        userId_itemId: {
          userId: session.user.id,
          itemId,
        },
      },
    });

    return NextResponse.json({
      message: "Article supprimé de votre liste de souhaits",
      success: true,
    });
  } catch (error) {
    console.error("[WISHLIST_DELETE]", error);
    return NextResponse.json(
      {
        error: "Échec de la suppression de l'article de la liste de souhaits",
        success: false,
      },
      { status: 500 }
    );
  }
}
