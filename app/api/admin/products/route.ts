import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await prisma.item.findMany({
      include: {
        images: true,
        category: true,
        brand: true,
        options: true,
      },
    });
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Error fetching products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      name,
      price,
      quantity,
      description,
      categoryId,
      images,
      brandId,
      options,
    } = data;

    // Filtre les options qui ont un nom et au moins une valeur
    const validOptions =
      options?.filter(
        (opt: { name: string; values: string[] }) =>
          opt.name.trim() !== "" && opt.values.length > 0
      ) || [];

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/\s+/g, "-");

    const product = await prisma.item.create({
      data: {
        name,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        description,
        slug,
        categoryId: categoryId || undefined,
        brandId: brandId || undefined,
        images: {
          create: images?.map((url: string) => ({ url })),
        },
        options: {
          create: validOptions.map(
            (option: { name: string; values: string[] }) => ({
              name: option.name.trim(),
              values: option.values.filter((v: string) => v.trim() !== ""),
            })
          ),
        },
      },
      include: {
        images: true,
        category: true,
        brand: true,
        options: true,
      },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...data } = await request.json();

    // Filtre les options qui ont un nom et au moins une valeur
    const validOptions =
      data.options?.filter(
        (opt: { name: string; values: string[] }) =>
          opt.name.trim() !== "" && opt.values.length > 0
      ) || [];

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // D'abord, supprimer les anciennes options
    await prisma.itemOption.deleteMany({
      where: { itemId: id },
    });

    const updatedProduct = await prisma.item.update({
      where: { id },
      data: {
        name: data.name,
        price: parseFloat(data.price),
        quantity: parseInt(data.quantity),
        description: data.description,
        categoryId: data.categoryId || undefined,
        brandId: data.brandId || undefined,
        images: {
          deleteMany: {},
          create: data.images?.map((url: string) => ({ url })),
        },
        options: {
          create: validOptions.map(
            (option: { name: string; values: string[] }) => ({
              name: option.name.trim(),
              values: option.values.filter((v: string) => v.trim() !== ""),
            })
          ),
        },
      },
      include: {
        images: true,
        category: true,
        brand: true,
        options: true,
      },
    });

    return NextResponse.json({ product: updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    await prisma.item.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
