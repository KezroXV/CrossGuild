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

async function getCategory(slug: string) {
  const formattedName = decodeURIComponent(slug).replace(/-/g, " ");

  const category = await prisma.category.findFirst({
    where: {
      name: {
        equals: formattedName,
        mode: "insensitive",
      },
    },
    include: {
      items: {
        where: { isPublished: true },
        include: {
          images: true,
          brand: true,
        },
      },
    },
  });

  if (!category) notFound();
  return category;
}

export default async function Page({ params }: Props) {
  const category = await getCategory(params.slug);

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
}
