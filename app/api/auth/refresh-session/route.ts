import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    // Récupérer les données utilisateur actualisées
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        isAdmin: true,
        roleId: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Ici, nous ne pouvons pas directement mettre à jour la session côté serveur
    // dans une API route avec Next.js 13+, mais nous renvoyons les données
    // utilisateur actualisées pour que le client puisse les utiliser
    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("[REFRESH_SESSION]", error);
    return NextResponse.json(
      { error: "Failed to refresh session" },
      { status: 500 }
    );
  }
}
