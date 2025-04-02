/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import FooterSection from "@/components/footer";
import ProductDetails from "@/components/ProductDetails";
import ProductReview from "@/components/ProductReview";

// Modifié pour être compatible avec les attentes de type de Next.js
type PageParams = {
  params: {
    slug: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
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

export async function generateStaticParams() {
  const products = await prisma.item.findMany({
    where: { isPublished: true },
  });
  return products.map((product) => ({
    slug: product.slug,
  }));
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
  // Vérifier que params et params.slug existent
  if (!params || !params.slug) {
    notFound();
  }

  try {
    const dbProduct = await getProduct(params.slug);

    if (!dbProduct) {
      notFound();
    }

    // Format the product to match the expected Product interface
    const formattedProduct = formatProduct(dbProduct);

    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow container mx-auto px-4 py-8">
          <ProductDetails product={formattedProduct} />
          <ProductReview productId={dbProduct.id} />
        </main>
        <FooterSection />
      </div>
    );
  } catch (error) {
    console.error("Error in ProductPage:", error);
    notFound();
  }
};

export default ProductPage;
