import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import FooterSection from "@/components/footer";
import { Navbar } from "@/components/navbar";
import ItemsCategories from "./itemsCategories";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  params: {
    slug: string;
  };
}

interface Category {
  name: string;
  description?: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    images: Array<{ url: string }>;
    brand?: {
      name: string;
    };
    isPublished: boolean;
    slug: string;
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
      brand: item.brand,
      slug: item.slug,
      isPublished: item.isPublished,
    })),
  };

  return formattedCategory;
}

export const metadata: Metadata = {
  title: "Category Page",
  description: "Browse items by category",
};

const CategoryPage = async ({ params }: Props) => {
  const category = await getCategory(params.slug);

  if (!category || !category.items) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center">
            <p>No items found in this category.</p>
          </div>
        </main>
        <FooterSection />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{category.name}</h1>
          {category.description && (
            <p className="text-gray-600 mt-2">{category.description}</p>
          )}
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-1/4">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Availability</h2>
              <div className="flex items-center mt-2">
                <Checkbox id="available" />
                <label htmlFor="available" className="ml-2">
                  Available
                </label>
              </div>
              <div className="flex items-center mt-2">
                <Checkbox id="out-of-stock" />
                <label htmlFor="out-of-stock" className="ml-2">
                  Out of stock
                </label>
              </div>
            </div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Price</h2>
              <Slider min={0} max={1000} step={10} />
              <Button className="mt-2">Filter</Button>
            </div>
          </aside>
          <section className="w-full md:w-3/4">
            <ItemsCategories items={category.items} />
          </section>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default CategoryPage;
