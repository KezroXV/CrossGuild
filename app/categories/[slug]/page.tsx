import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import FooterSection from "@/components/footer";
import { Navbar } from "@/components/navbar";
import ItemsCategories from "./itemsCategories";

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
    images: Array<{ url: string }>;
    brand: { name: string };
    isPublished: boolean;
  }>;
}

async function getCategory(slug: string) {
  const formattedName = decodeURIComponent(slug).replace(/-/g, " ");
  console.log("Searching for category:", formattedName);

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
          images: true,
          brand: true,
          category: true,
        },
      },
    },
  });

  console.log("Raw category data:", JSON.stringify(category, null, 2));

  if (!category) notFound();

  // Vérifions si les items sont vraiment vides
  if (!category.items || category.items.length === 0) {
    console.log("No items found for category:", formattedName);
  } else {
    console.log("Found items:", category.items.length);
  }

  return category;
}

export const metadata: Metadata = {
  title: "Category Page",
  description: "Browse items by category",
};

const CategoryPage = async ({ params }: Props) => {
  const category = await getCategory(params.slug);

  console.log("Category data:", category); // Debug log

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
        <ItemsCategories items={category.items} />
      </main>
      <FooterSection />
    </div>
  );
};

export default CategoryPage;
