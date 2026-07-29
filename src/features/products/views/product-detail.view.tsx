import ProductDetails from "@/shared/components/ProductDetails";
import ProductReviewsSection from "@/features/reviews/components/product-reviews-section.component";
import type { ProductDetailItem } from "@/features/products/types/product.type";

interface ProductDetailViewProps {
  product: ProductDetailItem;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <ProductDetails product={product} />
      <ProductReviewsSection
        productId={product.id}
        productName={product.name}
      />
    </div>
  );
}
