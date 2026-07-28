import { join } from "path";
import { existsSync, unlinkSync } from "fs";
import prisma from "@/shared/lib/prisma";
import { NotFoundError } from "@/shared/lib/handle-api-error";
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
