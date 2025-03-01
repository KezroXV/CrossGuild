import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import slugify from "slugify";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const products = await prisma.item.findMany({
      include: {
        images: true,
        categories: true,
      },
    });
    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to retrieve products" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, price, quantity, description, categoryIds, images } = data;

    if (!name || !price || !quantity) {
      return NextResponse.json(
        { error: "Name, price and quantity are required" },
        { status: 400 }
      );
    }

    const slug = slugify(name, { lower: true });

    const product = await prisma.item.create({
      data: {
        name,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        description,
        slug,
        categories: {
          connect: categoryIds?.map((id: string) => ({ id })) || [],
        },
        images: {
          create: images?.map((url: string) => ({ url })) || [],
        },
      },
      include: {
        images: true,
        categories: true,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, name, price, quantity, description, categoryIds, images } =
      data;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const updateData: any = {
      ...(name && { name }),
      ...(price && { price: parseFloat(price) }),
      ...(quantity && { quantity: parseInt(quantity) }),
      ...(description && { description }),
    };

    if (name) {
      updateData.slug = slugify(name, { lower: true });
    }

    const product = await prisma.item.update({
      where: { id },
      data: {
        ...updateData,
        ...(categoryIds && {
          categories: {
            set: categoryIds.map((id: string) => ({ id })),
          },
        }),
        ...(images && {
          images: {
            deleteMany: {},
            create: images.map((url: string) => ({ url })),
          },
        }),
      },
      include: {
        images: true,
        categories: true,
      },
    });

    return NextResponse.json({ product }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update product" },
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
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.item.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Product deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
