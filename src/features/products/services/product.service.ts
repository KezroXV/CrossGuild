import { API_BASE_URL } from "@/config/config";
import type { ProductListItem } from "@/features/products/types/product.type";

export async function fetchPublishedProducts(sort?: string) {
  const params = new URLSearchParams();
  if (sort) params.set("sort", sort);

  const query = params.toString();
  const url = `${API_BASE_URL}/api/products${query ? `?${query}` : ""}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  return res.json() as Promise<ProductListItem[]>;
}

export async function fetchRelatedProducts(
  categoryId: string,
  excludeId: string,
  limit = 4
) {
  const params = new URLSearchParams({
    categoryId,
    excludeId,
    limit: String(limit),
  });

  const res = await fetch(
    `${API_BASE_URL}/api/products/related?${params.toString()}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch related products");
  }

  return res.json();
}

export async function searchProducts(query: string) {
  const params = new URLSearchParams({ q: query });

  const res = await fetch(`${API_BASE_URL}/api/search?${params.toString()}`);

  if (!res.ok) {
    throw new Error("Failed to search products");
  }

  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${API_BASE_URL}/api/categories`);

  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }

  return res.json();
}

export type BrandListItem = {
  id: string;
  name: string;
  logo: string;
  description?: string;
  itemCount: number;
  slug: string;
};

export async function fetchBrands(): Promise<BrandListItem[]> {
  const res = await fetch(`${API_BASE_URL}/api/brands`);

  if (!res.ok) {
    throw new Error("Failed to fetch brands");
  }

  return res.json();
}

export async function fetchProductById(id: string) {
  const res = await fetch(`${API_BASE_URL}/api/products/${id}`);

  if (!res.ok) {
    throw new Error("Failed to fetch product");
  }

  return res.json();
}
