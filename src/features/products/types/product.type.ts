export interface ProductListItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  averageRating: number;
  topSelling: number;
  createdAt: Date;
  brand?: { name: string; id?: string };
  brandId?: string;
  isPublished: boolean;
  slug: string;
  images: Array<{ url: string }>;
  category?: { name: string } | null;
}

export interface ProductDetailItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  images: Array<{ url: string }>;
  brand?: { name: string };
  category?: { name: string; id?: string };
  reviews?: Array<{ rating: number }>;
  options: Array<{ id: string; name: string; values: string[] }>;
}

export interface CategoryPageData {
  name: string;
  description?: string | null;
  items: ProductListItem[];
}

export interface BrandPageData {
  id: string;
  name: string;
  logo: string;
  description?: string | null;
  slug: string;
  items: ProductListItem[];
}

export interface ProductFilterConfig {
  uniqueBrands: string[];
  uniqueCategories: string[];
  lowestPrice: number;
  highestPrice: number;
}

export function computeFilterConfig(
  items: ProductListItem[]
): ProductFilterConfig {
  const lowestPrice =
    items.length > 0 ? Math.min(...items.map((item) => item.price)) : 0;
  const highestPrice =
    items.length > 0 ? Math.max(...items.map((item) => item.price)) : 1000;

  const uniqueBrands = Array.from(
    new Set(
      items.map((item) => item.brand?.name).filter((brand) => brand !== undefined)
    )
  ) as string[];

  const uniqueCategories = Array.from(
    new Set(
      items
        .map((item) => item.category?.name)
        .filter((category) => category !== undefined)
    )
  ) as string[];

  return { uniqueBrands, uniqueCategories, lowestPrice, highestPrice };
}
