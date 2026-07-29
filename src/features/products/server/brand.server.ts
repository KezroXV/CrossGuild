import { join } from "path";
import { existsSync, unlinkSync } from "fs";
import prisma from "@/shared/lib/prisma";
import { NotFoundError } from "@/shared/lib/handle-api-error";
import type { BrandPageData } from "@/features/products/types/product.type";
import { uploadImage } from "@/shared/lib/upload.server";
import {
  createBrandSchema,
  updateBrandSchema,
} from "@/features/products/validations/brand.schema";
import type {
  CreateBrandInput,
  UpdateBrandInput,
} from "@/features/products/validations/brand.schema";

const brandSelect = {
  id: true,
  name: true,
  logo: true,
  description: true,
} as const;

async function resolveLogoUrl(logo: File | string | null | undefined) {
  if (logo && logo instanceof File && logo.size > 0) {
    return uploadImage(logo);
  }

  if (logo && typeof logo === "string" && logo.length > 0) {
    return logo;
  }

  return undefined;
}

export async function getBrands() {
  const brands = await prisma.brand.findMany({
    select: {
      id: true,
      name: true,
      logo: true,
      description: true,
      items: {
        select: { id: true },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  return brands.map(({ items, ...brand }) => ({
    ...brand,
    itemCount: items.length,
  }));
}

export async function createBrand(input: CreateBrandInput) {
  return prisma.brand.create({
    data: {
      name: input.name,
      description: input.description || undefined,
      logo: input.logo,
    },
    select: brandSelect,
  });
}

export async function createBrandFromFormData(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string | null;
  const logo = formData.get("logo") as File | string | null;
  const logoUrl = await resolveLogoUrl(logo);

  const input = createBrandSchema.parse({
    name,
    description: description || undefined,
    logo: logoUrl,
  });

  return createBrand(input);
}

export async function updateBrand(input: UpdateBrandInput) {
  const { id, ...data } = input;

  return prisma.brand.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description || undefined,
      logo: data.logo,
    },
    select: brandSelect,
  });
}

export async function updateBrandFromFormData(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string | null;
  const logo = formData.get("logo") as File | string | null;
  const logoUrl = await resolveLogoUrl(logo);

  const input = updateBrandSchema.parse({
    id,
    name,
    description: description || undefined,
    logo: logoUrl,
  });

  return updateBrand(input);
}

function slugToName(slug: string) {
  return decodeURIComponent(slug).replace(/-/g, " ");
}

export async function getBrandBySlug(brandSlug: string): Promise<BrandPageData> {
  if (!brandSlug) {
    throw new NotFoundError("Brand not found");
  }

  const brand = await prisma.brand.findFirst({
    where: {
      name: {
        equals: slugToName(brandSlug),
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

  if (!brand) {
    throw new NotFoundError("Brand not found");
  }

  return {
    id: brand.id,
    name: brand.name,
    logo: brand.logo || "/images/placeholder.jpg",
    description: brand.description,
    slug: brand.name.toLowerCase().replace(/\s+/g, "-"),
    items: brand.items.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      images: item.images,
      brand: item.brand || { name: brand.name },
      brandId: item.brand?.id,
      slug: item.slug,
      isPublished: item.isPublished,
      averageRating: item.averageRating,
      topSelling: item.topSelling,
      createdAt: item.createdAt,
    })),
  };
}

export async function deleteBrand(brandId: string) {
  const existingBrand = await prisma.brand.findUnique({
    where: { id: brandId },
    select: { logo: true },
  });

  if (!existingBrand) {
    throw new NotFoundError("Brand not found");
  }

  if (existingBrand.logo) {
    const logoPath = join(process.cwd(), "public", existingBrand.logo);
    if (existsSync(logoPath)) {
      unlinkSync(logoPath);
    }
  }

  await prisma.brand.delete({
    where: { id: brandId },
  });
}
