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

export default async function CategoryPage(props: {
  params: Promise<{ slug: string }>;
}) {
  try {
    const { slug } = await props.params;
    const category = await getCategoryBySlug(slug);
    return <CategoryView category={category} filterConfig={computeFilterConfig(category.items)} />;
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
}
