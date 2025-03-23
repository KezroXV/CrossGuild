import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import FooterSection from "@/components/footer";
import ProductDetails from "@/components/ProductDetails";
import ProductReview from "@/components/ProductReview";

interface Props {
  params: {
    slug: string;
  };
}

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

const ProductPage = async ({ params }: Props) => {
  // Vérifier que params et params.slug existent
  if (!params || !params.slug) {
    notFound();
  }

  try {
    const product = await getProduct(params.slug);

    if (!product) {
      notFound();
    }

    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow container mx-auto px-4 py-8">
          <ProductDetails product={product} />
          <ProductReview productId={product.id} />
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
