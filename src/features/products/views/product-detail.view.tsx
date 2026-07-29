"use client";

import ProductGallery from "@/features/products/components/product-gallery.component";
import ProductInfo from "@/features/products/components/product-info.component";
import ProductActions from "@/features/products/components/product-actions.component";
import ProductReviewsSection from "@/features/reviews/components/product-reviews-section.component";
import RelatedProducts from "@/shared/components/RelatedProducts";
import { useProductDetail } from "@/features/products/hooks/use-product-detail.hook";
import type { ProductDetailItem } from "@/features/products/types/product.type";

interface ProductDetailViewProps {
  product: ProductDetailItem;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const {
    quantity,
    setQuantity,
    selectedOptions,
    handleOptionSelect,
    handleQuantityChange,
    handleAddToCart,
    handleBuyNow,
    handleAddToWishlist,
    isAddingToCart,
    isAddingToWishlist,
    isInWishlist,
    isPending,
    averageRating,
  } = useProductDetail(product);

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <div className="flex flex-col md:flex-row gap-12 max-w-7xl mx-auto bg-gradient-to-br from-background via-background to-muted/5 rounded-3xl p-8 shadow-2xl border border-accent/10">
        <div className="w-full md:w-1/2 flex justify-center">
          <ProductGallery
            product={product}
            quantity={quantity}
            onQuantityChange={handleQuantityChange}
            onQuantityDecrease={() => setQuantity((prev) => Math.max(1, prev - 1))}
            onQuantityIncrease={() =>
              setQuantity((prev) => Math.min(product.quantity, prev + 1))
            }
            selectedOptions={selectedOptions}
            onOptionSelect={handleOptionSelect}
          />
        </div>

        <div className="w-full md:w-1/2 max-w-[500px] relative">
          <div className="absolute -top-6 -right-6 w-40 h-40 bg-gradient-to-bl from-accent/5 to-primary/5 rounded-full blur-3xl" />
          <ProductInfo product={product} averageRating={averageRating} />
          <ProductActions
            product={product}
            averageRating={averageRating}
            isAddingToCart={isAddingToCart}
            isAddingToWishlist={isAddingToWishlist}
            isInWishlist={isInWishlist}
            isPending={isPending}
            onBuyNow={handleBuyNow}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleAddToWishlist}
          />
        </div>
      </div>

      <div className="mt-16">
        <RelatedProducts />
      </div>

      <ProductReviewsSection productId={product.id} productName={product.name} />
    </div>
  );
}
