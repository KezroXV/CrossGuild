import { NextRequest } from "next/server";
import { withAdmin } from "@/shared/lib/with-admin";
import prisma from "@/shared/lib/prisma";
import { mapUserFields } from "@/shared/lib/user-fields";

export const GET = withAdmin(async () => {
  try {
    const users = await prisma.user.findMany({
      include: {
        role: true,
      },
    });
    return Response.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Error retrieving users:", error);
    return Response.json(
      { error: "Failed to retrieve users" },
      { status: 500 }
    );
  }
});

export const PUT = withAdmin(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const mappedUser = mapUserFields(body);

    const updatedUser = await prisma.user.update({
      where: { id: mappedUser.id },
      data: mappedUser,
    });

    return Response.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return Response.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
});

export const DELETE = withAdmin(async (req: NextRequest) => {
  try {
    const { id } = await req.json();

    if (!id) {
      return Response.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return Response.json({ message: "User deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return Response.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
});
