/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/shared/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import ProductDetails from "@/shared/components/ProductDetails";

export const dynamic = "force-dynamic";

// Modifié pour être compatible avec les attentes de type de Next.js
type PageParams = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  images: Array<{ url: string }>;
  brand?: {
    name: string;
  };
  options: Array<{
    id: string;
    name: string;
    values: string[];
  }>;
}

async function getProduct(slug: string) {
  if (!slug) return null;

  try {
    const product = await prisma.item.findFirst({
      where: {
        slug: slug,
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
          },
        },
        category: {
          select: {
            name: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
        options: true,
      },
    });

    return product;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export const metadata: Metadata = {
  title: "Product Details",
  description: "View product details and specifications",
};

// Function to ensure product data matches the expected Product interface
function formatProduct(dbProduct: any): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name || "",
    description: dbProduct.description || "",
    price: dbProduct.price || 0,
    quantity: dbProduct.quantity || 0,
    images: dbProduct.images || [],
    brand: dbProduct.brand || undefined,
    options: dbProduct.options.map((option: any) => ({
      id: option.id,
      name: option.name,
      values: Array.isArray(option.values) ? option.values : [],
    })),
  };
}

const ProductPage = async ({ params }: PageParams) => {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  try {
    const dbProduct = await getProduct(slug);

    if (!dbProduct) {
      notFound();
    }

    // Format the product to match the expected Product interface
    const formattedProduct = formatProduct(dbProduct);

    return (
      <div className="container mx-auto px-4 py-8 mt-20">
        <ProductDetails product={formattedProduct} />
      </div>
    );
  } catch (error) {
    console.error("Error in ProductPage:", error);
    notFound();
  }
};

export default ProductPage;
