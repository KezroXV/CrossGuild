import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BrandView from "@/features/products/views/brand.view";
import { getBrandBySlug } from "@/features/products/server/brand.server";
import { computeFilterConfig } from "@/features/products/types/product.type";
import { NotFoundError } from "@/shared/lib/handle-api-error";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Brand Details",
  description: "Browse items by brand",
};

export default async function BrandPage(props: {
  params: Promise<{ slug: string }>;
}) {
  try {
    const { slug } = await props.params;
    const brand = await getBrandBySlug(slug);
    return <BrandView brand={brand} filterConfig={computeFilterConfig(brand.items)} />;
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
}
