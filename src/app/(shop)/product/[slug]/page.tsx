import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailView from "@/features/products/views/product-detail.view";
import {
  findBySlug,
  formatProductForDetail,
} from "@/features/products/server/product.server";
import { NotFoundError } from "@/shared/lib/handle-api-error";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Product Details",
  description: "View product details and specifications",
};

type PageParams = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: PageParams) {
  const { slug } = await params;

  if (!slug) notFound();

  try {
    const product = await findBySlug(slug);
    return <ProductDetailView product={formatProductForDetail(product)} />;
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
}
