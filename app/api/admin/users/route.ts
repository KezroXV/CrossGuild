import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { mapUserFields } from "@/lib/user-fields";

const prisma = new PrismaClient();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: Request) {
  try {
    // Utiliser une sélection explicite des champs pour éviter les erreurs
    const users = await prisma.user.findMany({
      include: {
        role: true,
      },
      // N'ajoutez pas de champs qui n'existent pas dans la base de données
    });
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Error retrieving users:", error);
    return NextResponse.json(
      { error: "Failed to retrieve users" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    // Map any inconsistent field names
    const mappedUser = mapUserFields(body);

    // Update user with the mapped fields
    const updatedUser = await prisma.user.update({
      where: { id: mappedUser.id },
      data: mappedUser,
    });

    // Return the updated user
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "User deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
