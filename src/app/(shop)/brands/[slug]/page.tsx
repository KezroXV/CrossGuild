import prisma from "@/shared/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";

import ClientSideCategoryPage from "../../categories/[slug]/components/ClientSideCategoryPage";

export const dynamic = "force-dynamic";

type PageParams = {
  params: Promise<{
    slug: string;
  }>;
};

interface Brand {
  id: string;
  name: string;
  logo: string;
  description?: string;
  slug: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    images: Array<{ url: string }>;
    slug: string;
    isPublished: boolean;
    averageRating: number;
    topSelling: number;
  }>;
}

async function getBrand(brandSlug: string): Promise<Brand | null> {
  if (!brandSlug) return null;

  // Utiliser le nom comme identifiant en remplaçant les tirets par des espaces
  const formattedName = decodeURIComponent(brandSlug).replace(/-/g, " ");

  const brand = await prisma.brand.findFirst({
    where: {
      name: {
        equals: formattedName,
        mode: "insensitive",
      },
    },
    include: {
      items: {
        where: {
          isPublished: true,
        },
        include: {
          images: {
            select: {
              url: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!brand) notFound();

  return {
    ...brand,
    slug: brand.name.toLowerCase().replace(/\s+/g, "-"), // Generate slug from brand name
  } as Brand;
}

export const metadata: Metadata = {
  title: "Brand Details",
  description: "Browse items by brand",
};

export default async function BrandPage({ params }: PageParams) {
  const { slug } = await params;
  const brand = await getBrand(slug);

  if (!brand) {
    return (
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="text-center">
          <p>Brand not found.</p>
        </div>
      </div>
    );
  }

  // Calculate price range for the slider
  const lowestPrice =
    brand.items.length > 0
      ? Math.min(...brand.items.map((item) => item.price))
      : 0;
  const highestPrice =
    brand.items.length > 0
      ? Math.max(...brand.items.map((item) => item.price))
      : 1000;

  // On n'a pas besoin de uniqueBrands puisque nous sommes déjà dans une page de marque
  const uniqueBrands = [brand.name];

  return (
    <div className="container mx-auto px-4 py-8 pt-28">
      <div className="flex flex-col md:flex-row items-center gap-8 mb-12 p-6 rounded-lg shadow-md bg-card">
          <div className="relative w-40 h-40">
            <Image
              src={brand.logo || "/images/placeholder.jpg"}
              alt={brand.name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 160px"
              priority
            />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2">{brand.name}</h1>
            {brand.description && (
              <p className="text-muted-foreground mb-4">{brand.description}</p>
            )}
            <p className="text-sm">
              <span className="font-medium">{brand.items.length}</span> products
              available
            </p>
          </div>
        </div>

      <ClientSideCategoryPage
        items={brand.items}
        categoryName={brand.name}
        uniqueBrands={uniqueBrands}
        lowestPrice={lowestPrice}
        highestPrice={highestPrice}
      />
    </div>
  );
}
