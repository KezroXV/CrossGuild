/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    // Get pagination and filtering params
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") || "desc";
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const limit = parseInt(searchParams.get("limit") || "0"); // Construct the where clause for filtering
    const where: any = {};

    if (category) {
      where.categoryId = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Define how to sort the results
    const orderBy: any = {};
    if (sort === "topSelling") {
      orderBy.topSelling = order;
    } else if (sort === "price") {
      orderBy.price = order;
    } else if (sort === "createdAt") {
      orderBy.createdAt = order;
    }

    // Calculate pagination parameters
    const skip = (page - 1) * pageSize;

    // Get count for pagination
    const totalProducts = await prisma.item.count({ where });
    const totalPages = Math.ceil(totalProducts / pageSize);

    // Get products
    const products = await prisma.item.findMany({
      where,
      include: {
        images: true,
        category: true,
        brand: true,
      },
      orderBy,
      skip: limit ? 0 : skip,
      take: limit || pageSize,
    });

    return NextResponse.json({
      products,
      totalPages,
      currentPage: page,
      totalProducts,
    });
  } catch (error) {
    console.error("[PRODUCTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
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
      cost,
      isPublished,
    } = data;

    // Debug log
    console.log("Received product data:", data);

    // Validation stricte
    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (price === undefined || isNaN(Number(price))) {
      return NextResponse.json(
        { error: "Price is required and must be a number" },
        { status: 400 }
      );
    }
    if (quantity === undefined || isNaN(Number(quantity))) {
      return NextResponse.json(
        { error: "Quantity is required and must be a number" },
        { status: 400 }
      );
    }    // Vérification des URLs d'images
    if (Array.isArray(images)) {
      for (const url of images) {
        if (
          typeof url !== "string" ||
          (!url.startsWith("http") && !url.startsWith("/uploads/") && !url.includes("cloudinary.com"))
        ) {
          return NextResponse.json(
            {
              error:
                "Each image must be a valid URL (http(s)://, /uploads/... ou cloudinary.com)",
            },
            { status: 400 }
          );
        }
      }
    }

    const priceValue = parseFloat(price);
    const costValue = parseFloat(cost || "0");
    const quantityValue = parseInt(quantity);

    // Calcul automatique de la marge et du profit
    const profitValue = priceValue - costValue;
    const marginValue = priceValue > 0 ? (profitValue / priceValue) * 100 : 0;

    // Génération du slug unique
    let slug = name.toLowerCase().replace(/\s+/g, "-");
    // Vérifier l'unicité du slug
    let slugExists = await prisma.item.findUnique({ where: { slug } });
    let slugSuffix = 1;
    while (slugExists) {
      slug = `${name.toLowerCase().replace(/\s+/g, "-")}-${slugSuffix++}`;
      slugExists = await prisma.item.findUnique({ where: { slug } });
    }

    // Filtre les options qui ont un nom et au moins une valeur
    const validOptions =
      options?.filter(
        (opt: { name: string; values: string[] }) =>
          typeof opt.name === "string" &&
          opt.name.trim() !== "" &&
          Array.isArray(opt.values) &&
          opt.values.length > 0
      ) || [];
    // Création du produit
    const product = await prisma.item.create({
      data: {
        name,
        price: priceValue,
        quantity: quantityValue,
        description,
        slug,
        categoryId: categoryId || undefined,
        brandId: brandId || undefined,
        cost: costValue,
        profit: profitValue,
        margin: marginValue,
        totalProfit: 0,
        isPublished: isPublished !== undefined ? isPublished : false,
        images: {
          create: Array.isArray(images)
            ? images.map((url: string) => ({ url }))
            : [],
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
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product", details: error?.message || error },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...data } = await request.json();
    const {
      price,
      cost,
      // ...other fields
    } = data;

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

    const priceValue = parseFloat(price);
    const costValue = parseFloat(cost || "0");

    // Calcul automatique de la marge et du profit
    const profitValue = priceValue - costValue;
    const marginValue = costValue > 0 ? (profitValue / priceValue) * 100 : 0;

    // D'abord, supprimer les anciennes options
    await prisma.itemOption.deleteMany({
      where: { itemId: id },
    });
    const updatedProduct = await prisma.item.update({
      where: { id },
      data: {
        name: data.name,
        price: priceValue,
        quantity: parseInt(data.quantity),
        description: data.description,
        categoryId: data.categoryId || undefined,
        brandId: data.brandId || undefined,
        cost: costValue,
        profit: profitValue,
        margin: marginValue,
        isPublished: data.isPublished !== undefined ? data.isPublished : true,
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
