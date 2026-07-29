import prisma from "@/shared/lib/prisma";
import {
  NotFoundError,
  ValidationError,
} from "@/shared/lib/handle-api-error";
import type {
  ProductDetailItem,
  ProductListItem,
} from "@/features/products/types/product.type";
import type {
  AdminProductsQuery,
  CreateProductInput,
  ProductListQuery,
  RelatedProductsQuery,
  UpdateProductInput,
} from "@/features/products/validations/product.schema";

const productDetailInclude = {
  images: true,
  category: true,
  brand: true,
  options: true,
} as const;

const productWithReviewsInclude = {
  ...productDetailInclude,
  reviews: {
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  },
} as const;

const adminProductInclude = {
  images: true,
  category: true,
  brand: true,
  options: true,
} as const;

function filterValidOptions(
  options?: Array<{ name: string; values: string[] }>
) {
  return (
    options?.filter(
      (opt) =>
        typeof opt.name === "string" &&
        opt.name.trim() !== "" &&
        Array.isArray(opt.values) &&
        opt.values.length > 0
    ) ?? []
  );
}

function computeProfitMetrics(price: number, cost: number) {
  const profitValue = price - cost;
  const marginValue = price > 0 ? (profitValue / price) * 100 : 0;

  return { profitValue, marginValue };
}

async function generateUniqueSlug(name: string) {
  let slug = name.toLowerCase().replace(/\s+/g, "-");
  let slugExists = await prisma.item.findUnique({ where: { slug } });
  let slugSuffix = 1;

  while (slugExists) {
    slug = `${name.toLowerCase().replace(/\s+/g, "-")}-${slugSuffix++}`;
    slugExists = await prisma.item.findUnique({ where: { slug } });
  }

  return slug;
}

export async function getAllPublishedProducts(): Promise<ProductListItem[]> {
  const items = await prisma.item.findMany({
    where: { isPublished: true },
    include: {
      images: { select: { url: true } },
      brand: { select: { name: true, id: true } },
      category: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return items.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    images: item.images,
    brand: item.brand || undefined,
    brandId: item.brand?.id,
    slug: item.slug,
    isPublished: item.isPublished,
    averageRating: item.averageRating,
    topSelling: item.topSelling,
    createdAt: item.createdAt,
    category: item.category,
  }));
}

export async function getPublishedProducts(query: ProductListQuery) {
  const products = await prisma.item.findMany({
    where: {
      isPublished: true,
      topSelling: { gt: 0 },
    },
    orderBy: query.sort === "topSelling" ? { topSelling: "desc" } : undefined,
    include: { images: true },
  });

  return products;
}

export async function getProductById(productId: string) {
  const product = await prisma.item.findUnique({
    where: { id: productId },
    include: productWithReviewsInclude,
  });

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  return product;
}

export async function findBySlug(slug: string, publishedOnly = true) {
  const product = await prisma.item.findFirst({
    where: {
      slug,
      ...(publishedOnly && { isPublished: true }),
    },
    include: productWithReviewsInclude,
  });

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  return product;
}

export function formatProductForDetail(
  product: Awaited<ReturnType<typeof findBySlug>>
): ProductDetailItem {
  return {
    id: product.id,
    name: product.name,
    description: product.description || "",
    price: product.price,
    quantity: product.quantity,
    images: product.images.map((image) => ({ url: image.url })),
    brand: product.brand ? { name: product.brand.name } : undefined,
    category: product.category
      ? { name: product.category.name, id: product.category.id }
      : undefined,
    reviews: product.reviews?.map((review) => ({ rating: review.rating })),
    options: product.options.map((option) => ({
      id: option.id,
      name: option.name,
      values: Array.isArray(option.values) ? (option.values as string[]) : [],
    })),
  };
}

export async function getRelatedProducts(query: RelatedProductsQuery) {
  const { categoryId, excludeId, limit } = query;

  let relatedProducts = await prisma.item.findMany({
    where: {
      categoryId,
      isPublished: true,
      ...(excludeId && { id: { not: excludeId } }),
    },
    include: {
      images: true,
      brand: true,
      category: true,
    },
    take: limit,
  });

  if (relatedProducts.length < limit) {
    const moreProducts = await prisma.item.findMany({
      where: {
        isPublished: true,
        ...(excludeId && { id: { not: excludeId } }),
        id: { notIn: relatedProducts.map((product) => product.id) },
      },
      include: {
        images: true,
        brand: true,
        category: true,
      },
      take: limit - relatedProducts.length,
    });

    relatedProducts = [...relatedProducts, ...moreProducts];
  }

  return relatedProducts;
}

export async function getAdminProducts(query: AdminProductsQuery) {
  const { page, pageSize, sort, order, category, search, limit } = query;

  const where: {
    categoryId?: string;
    OR?: Array<{
      name?: { contains: string; mode: "insensitive" };
      description?: { contains: string; mode: "insensitive" };
    }>;
  } = {};

  if (category) {
    where.categoryId = category;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const orderBy: Record<string, "asc" | "desc"> = {};
  if (sort === "topSelling") {
    orderBy.topSelling = order;
  } else if (sort === "price") {
    orderBy.price = order;
  } else {
    orderBy.createdAt = order;
  }

  const skip = (page - 1) * pageSize;

  const [totalProducts, products] = await Promise.all([
    prisma.item.count({ where }),
    prisma.item.findMany({
      where,
      include: adminProductInclude,
      orderBy,
      skip: limit ? 0 : skip,
      take: limit || pageSize,
    }),
  ]);

  return {
    products,
    totalPages: Math.ceil(totalProducts / pageSize),
    currentPage: page,
    totalProducts,
  };
}

export async function createProduct(input: CreateProductInput) {
  const priceValue = Number(input.price);
  const costValue = Number(input.cost ?? 0);
  const quantityValue = Number(input.quantity);

  if (Number.isNaN(priceValue)) {
    throw new ValidationError("Price must be a number");
  }

  if (Number.isNaN(quantityValue)) {
    throw new ValidationError("Quantity must be a number");
  }

  const { profitValue, marginValue } = computeProfitMetrics(
    priceValue,
    costValue
  );
  const slug = await generateUniqueSlug(input.name);
  const validOptions = filterValidOptions(input.options);

  const product = await prisma.item.create({
    data: {
      name: input.name,
      price: priceValue,
      quantity: quantityValue,
      description: input.description,
      slug,
      categoryId: input.categoryId || undefined,
      brandId: input.brandId || undefined,
      cost: costValue,
      profit: profitValue,
      margin: marginValue,
      totalProfit: 0,
      isPublished: input.isPublished ?? false,
      images: {
        create: input.images?.map((url) => ({ url })) ?? [],
      },
      options: {
        create: validOptions.map((option) => ({
          name: option.name.trim(),
          values: option.values.filter((value) => value.trim() !== ""),
        })),
      },
    },
    include: adminProductInclude,
  });

  return product;
}

export async function updateProduct(input: UpdateProductInput) {
  const { id, ...data } = input;

  const priceValue = data.price !== undefined ? Number(data.price) : undefined;
  const costValue = data.cost !== undefined ? Number(data.cost) : undefined;
  const quantityValue =
    data.quantity !== undefined ? Number(data.quantity) : undefined;

  if (priceValue !== undefined && Number.isNaN(priceValue)) {
    throw new ValidationError("Price must be a number");
  }

  if (quantityValue !== undefined && Number.isNaN(quantityValue)) {
    throw new ValidationError("Quantity must be a number");
  }

  const validOptions = filterValidOptions(data.options);

  let profitValue: number | undefined;
  let marginValue: number | undefined;

  if (priceValue !== undefined) {
    const metrics = computeProfitMetrics(priceValue, costValue ?? 0);
    profitValue = metrics.profitValue;
    marginValue = metrics.marginValue;
  }

  await prisma.itemOption.deleteMany({
    where: { itemId: id },
  });

  const updatedProduct = await prisma.item.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(priceValue !== undefined && { price: priceValue }),
      ...(quantityValue !== undefined && { quantity: quantityValue }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.categoryId !== undefined && {
        categoryId: data.categoryId || null,
      }),
      ...(data.brandId !== undefined && { brandId: data.brandId || null }),
      ...(costValue !== undefined && { cost: costValue }),
      ...(profitValue !== undefined && { profit: profitValue }),
      ...(marginValue !== undefined && { margin: marginValue }),
      ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
      ...(data.images !== undefined && {
        images: {
          deleteMany: {},
          create: data.images.map((url) => ({ url })),
        },
      }),
      ...(data.options !== undefined && {
        options: {
          create: validOptions.map((option) => ({
            name: option.name.trim(),
            values: option.values.filter((value) => value.trim() !== ""),
          })),
        },
      }),
    },
    include: adminProductInclude,
  });

  return updatedProduct;
}

export async function deleteProduct(productId: string) {
  await prisma.item.delete({
    where: { id: productId },
  });
}

export async function updateStock(itemId: string, quantity: number) {
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    select: { id: true },
  });

  if (!item) {
    throw new NotFoundError("Product not found");
  }

  return prisma.item.update({
    where: { id: itemId },
    data: {
      quantity,
      isPublished: quantity > 0,
    },
  });
}
