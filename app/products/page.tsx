import prisma from "@/lib/prisma";
import { Metadata } from "next";
import FooterSection from "@/components/footer";
import { Navbar } from "@/components/navbar";
import ClientSideAllProductsPage from "./components/ClientSideAllProductsPage";

interface Item {
  id: string;
  name: string;
  price: number;
  quantity: number;
  images: Array<{ url: string }>;
  brand?: {
    name: string;
    id: string;
  };
  brandId?: string;
  isPublished: boolean;
  slug: string;
  averageRating: number;
  topSelling: number;
  createdAt: Date;
  categoryId: string | null;
  category: {
    name: string;
  } | null;
}

async function getAllProducts(): Promise<Item[]> {
  const items = await prisma.item.findMany({
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
          id: true,
        },
      },
      category: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return items.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    images: item.images,
    brand: item.brand || undefined,
    brandId: item.brand?.id,
    slug: item.slug,
    isPublished: item.isPublished,
    averageRating: item.averageRating,
    topSelling: item.topSelling,
    createdAt: item.createdAt,
    categoryId: item.categoryId,
    category: item.category,
  }));
}

export const metadata: Metadata = {
  title: "All Products - CrossGuild",
  description: "Browse all available products",
};

const AllProductsPage = async () => {
  const items = await getAllProducts();

  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 mt-20">
          <div className="text-center">
            <p>No products found.</p>
          </div>
        </main>
        <FooterSection />
      </div>
    );
  }

  // Calculate price range for the slider
  const lowestPrice = Math.min(...items.map((item) => item.price));
  const highestPrice = Math.max(...items.map((item) => item.price));

  // Get unique brands across all products
  const uniqueBrands = Array.from(
    new Set(
      items
        .map((item) => item.brand?.name)
        .filter((brand) => brand !== undefined)
    )
  ) as string[];
  // Get unique categories across all products
  const uniqueCategories = Array.from(
    new Set(
      items
        .filter((item) => item.category !== null)
        .map((item) => item.category!.name)
    )
  ) as string[];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 pt-28">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">All Products</h1>
          <p className="text-gray-600 mt-2">
            Discover our complete collection of products
          </p>
        </div>

        <ClientSideAllProductsPage
          items={items}
          uniqueBrands={uniqueBrands}
          uniqueCategories={uniqueCategories}
          lowestPrice={lowestPrice}
          highestPrice={highestPrice}
        />
      </main>
      <FooterSection />
    </div>
  );
};

export default AllProductsPage;
