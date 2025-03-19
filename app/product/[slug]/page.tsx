import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import FooterSection from "@/components/footer";
import ProductDetails from "@/components/ProductDetails";

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
    },
  });

  if (!product) notFound();

  return product;
}

export const metadata: Metadata = {
  title: "Product Details",
  description: "View product details and specifications",
};

const ProductPage = async ({ params }: Props) => {
  const product = await getProduct(params.slug);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center">
            <p>Product not found.</p>
          </div>
        </main>
        <FooterSection />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8">
        <ProductDetails product={product} />
      </main>
      <FooterSection />
    </div>
  );
};

export default ProductPage;
