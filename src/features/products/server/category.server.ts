import prisma from "@/shared/lib/prisma";
import { NotFoundError } from "@/shared/lib/handle-api-error";
import type { CategoryPageData } from "@/features/products/types/product.type";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/features/products/validations/category.schema";

function slugToName(slug: string) {
  return decodeURIComponent(slug).replace(/-/g, " ");
}

export async function getPublicCategories() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { items: true },
      },
      items: {
        take: 4,
        select: {
          id: true,
          name: true,
          images: {
            take: 1,
            select: { url: true },
          },
        },
      },
    },
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    image: category.image || "/images/placeholder.jpg",
    description: category.description,
    itemCount: category._count.items,
    recentItems: category.items.map((item) => ({
      id: item.id,
      name: item.name,
      image: item.images[0]?.url || "/images/placeholder.jpg",
    })),
  }));
}

export async function getAdminCategories() {
  return prisma.category.findMany();
}

export async function createCategory(input: CreateCategoryInput) {
  return prisma.category.create({
    data: {
      name: input.name,
      description: input.description,
      image: input.image,
    },
  });
}

export async function updateCategory(input: UpdateCategoryInput) {
  const { id, ...data } = input;

  return prisma.category.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      image: data.image,
    },
  });
}

export async function deleteCategory(categoryId: string) {
  await prisma.category.delete({
    where: { id: categoryId },
  });
}

export async function getCategoryBySlug(
  categorySlug: string
): Promise<CategoryPageData> {
  if (!categorySlug) {
    throw new NotFoundError("Category not found");
  }

  const category = await prisma.category.findFirst({
    where: {
      name: {
        equals: slugToName(categorySlug),
        mode: "insensitive",
      },
    },
    include: {
      items: {
        where: { isPublished: true },
        include: {
          images: { select: { url: true } },
          brand: { select: { name: true, id: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  return {
    name: category.name,
    description: category.description,
    items: category.items.map((item) => ({
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
    })),
  };
}
