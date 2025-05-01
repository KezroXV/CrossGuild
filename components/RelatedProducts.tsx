"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  averageRating: number;
  brand?: {
    name: string;
  };
  images: { url: string }[];
  slug: string;
  quantity: number;
  category?: {
    id: string;
    name: string;
  };
}

interface RelatedProductsProps {
  productId: string;
  categoryId?: string;
}

const RelatedProducts = ({ productId, categoryId }: RelatedProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [visibleWidth, setVisibleWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  const updateWidths = () => {
    if (containerRef) {
      setVisibleWidth(containerRef.clientWidth);
      setContentWidth(containerRef.scrollWidth);
    }
  };

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!categoryId) return;

      try {
        setLoading(true);
        const response = await fetch(
          `/api/products/related?categoryId=${categoryId}&excludeId=${productId}&limit=8`
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Related products data:", data);

        if (data.products && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          console.error("Invalid products data format:", data);
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching related products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [productId, categoryId]);

  useEffect(() => {
    updateWidths();
    window.addEventListener("resize", updateWidths);

    return () => {
      window.removeEventListener("resize", updateWidths);
    };
  }, [containerRef, products]);

  const scrollNext = () => {
    if (containerRef) {
      const newPosition = Math.min(
        scrollPosition + containerRef.clientWidth - 100,
        containerRef.scrollWidth - containerRef.clientWidth
      );
      containerRef.scrollTo({ left: newPosition, behavior: "smooth" });
      setScrollPosition(newPosition);
    }
  };

  const scrollPrev = () => {
    if (containerRef) {
      const newPosition = Math.max(
        scrollPosition - containerRef.clientWidth + 100,
        0
      );
      containerRef.scrollTo({ left: newPosition, behavior: "smooth" });
      setScrollPosition(newPosition);
    }
  };

  if (loading) {
    return (
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Related Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-muted rounded-md"></div>
              <div className="mt-2 h-4 bg-muted rounded w-3/4"></div>
              <div className="mt-2 h-4 bg-muted rounded w-1/4"></div>
              <div className="mt-2 h-6 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!products.length) {
    return null;
  }

  return (
    <div className="mt-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Related Products</h2>
        {contentWidth > visibleWidth && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollPrev}
              disabled={scrollPosition <= 0}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={scrollNext}
              disabled={scrollPosition >= contentWidth - visibleWidth}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      <div className="relative">
        <div
          ref={setContainerRef}
          className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide scroll-smooth"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
          onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex-shrink-0 w-[270px]"
            >
              <ProductCard item={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RelatedProducts;
