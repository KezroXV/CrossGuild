import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryView from "@/features/products/views/category.view";
import { getCategoryBySlug } from "@/features/products/server/category.server";
import { computeFilterConfig } from "@/features/products/types/product.type";
import { NotFoundError } from "@/shared/lib/handle-api-error";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Category Page",
  description: "Browse items by category",
};

type PageParams = {
  params: Promise<{ slug: string }>;
};

export default async function CategoryPage({ params }: PageParams) {
  const { slug } = await params;

  try {
    const category = await getCategoryBySlug(slug);

    if (!category.items.length) {
      return (
        <div className="container mx-auto px-4 py-8 mt-20">
          <div className="text-center">
            <p>No items found in this category.</p>
          </div>
        </div>
      );
    }

    return (
      <CategoryView
        category={category}
        filterConfig={computeFilterConfig(category.items)}
      />
    );
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
}
