/* eslint-disable @typescript-eslint/no-unused-vars */
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import FooterSection from "@/components/footer";
import { Navbar } from "@/components/navbar";
import ItemsCategories from "./itemsCategories";
import ClientSideCategoryPage from "./components/ClientSideCategoryPage";

// Modifié pour être compatible avec les attentes de type de Next.js
type PageParams = {
  params: {
    slug: string;
  };
  searchParams?: {
    inStock?: string;
    outOfStock?: string;
    minPrice?: string;
    maxPrice?: string;
    brand?: string;
    rating?: string;
    sort?: string;
  };
};

interface Category {
  name: string;
  description?: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    images: Array<{ url: string }>;
    brand?: {
      name: string;
    };
    brandId?: string;
    isPublished: boolean;
    slug: string;
    averageRating: number;
    topSelling: number;
    createdAt: Date;
  }>;
}

export async function generateStaticParams() {
  const categories = await prisma.category.findMany();
  return categories.map((category) => ({
    slug: category.name.toLowerCase().replace(/ /g, "-"),
  }));
}

async function getCategory(categorySlug: string) {
  if (!categorySlug) return null;

  const formattedName = decodeURIComponent(categorySlug).replace(/-/g, " ");

  const category = await prisma.category.findFirst({
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
          brand: {
            select: {
              name: true,
              id: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!category) notFound();

  const formattedCategory = {
    ...category,
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

  return formattedCategory;
}

export const metadata: Metadata = {
  title: "Category Page",
  description: "Browse items by category",
};

const CategoryPage = async ({ params }: PageParams) => {
  // Get the slug directly from params
  const slug = params.slug;
  const category = await getCategory(slug);

  if (!category || !category.items) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 mt-20">
          <div className="text-center">
            <p>No items found in this category.</p>
          </div>
        </main>
        <FooterSection />
      </div>
    );
  }

  // Calculate price range for the slider
  const lowestPrice = Math.min(...category.items.map((item) => item.price));
  const highestPrice = Math.max(...category.items.map((item) => item.price));

  // Get unique brands in this category
  const uniqueBrands = Array.from(
    new Set(
      category.items
        .map((item) => item.brand?.name)
        .filter((brand) => brand !== undefined)
    )
  ) as string[];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 pt-28">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{category.name}</h1>
          {category.description && (
            <p className="text-gray-600 mt-2">{category.description}</p>
          )}
        </div>

        <ClientSideCategoryPage
          items={category.items}
          categoryName={category.name}
          uniqueBrands={uniqueBrands}
          lowestPrice={lowestPrice}
          highestPrice={highestPrice}
        />
      </main>
      <FooterSection />
    </div>
  );
};

export default CategoryPage;
