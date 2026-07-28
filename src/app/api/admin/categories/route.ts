import { NextRequest } from "next/server";
import { withAdmin } from "@/shared/lib/with-admin";
import prisma from "@/shared/lib/prisma";

export const GET = withAdmin(async () => {
  try {
    const categories = await prisma.category.findMany();
    return Response.json({ categories }, { status: 200 });
  } catch {
    return Response.json(
      { error: "Failed to retrieve categories" },
      { status: 500 }
    );
  }
});

export const POST = withAdmin(async (req: NextRequest) => {
  try {
    const { name, description, image } = await req.json();
    if (!name) {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
        image,
      },
    });

    return Response.json({ category }, { status: 201 });
  } catch {
    return Response.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
});

export const DELETE = withAdmin(async (req: NextRequest) => {
  try {
    const { id } = await req.json();
    if (!id) {
      return Response.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.category.delete({
      where: { id },
    });

    return Response.json({ message: "Category deleted" }, { status: 200 });
  } catch {
    return Response.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
});

export const PUT = withAdmin(async (req: NextRequest) => {
  try {
    const { id, name, description, image } = await req.json();

    if (!id || !name) {
      return Response.json(
        { error: "ID and name are required" },
        { status: 400 }
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        description,
        image,
      },
    });

    return Response.json({ category }, { status: 200 });
  } catch {
    return Response.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
});
