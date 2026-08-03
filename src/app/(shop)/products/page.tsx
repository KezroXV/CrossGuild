import type { Metadata } from "next";
import ProductsView from "@/features/products/views/products.view";
import { getAllPublishedProducts } from "@/features/products/server/product.server";
import {
  computeFilterConfig,
  type ProductListItem,
} from "@/features/products/types/product.type";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All Products - CrossGuild",
  description: "Browse all available products",
};

export default async function ProductsPage() {
  const allItems = await getAllPublishedProducts();
  const items = allItems
    .filter((item) => item.category !== null)
    .map((item) => ({ ...item, category: item.category! })) as ProductListItem[];

  return (
    <ProductsView items={items} filterConfig={computeFilterConfig(items)} />
  );
}
