import Image from "next/image";
import { CategoryProductGrid } from "@/features/products/components/category-product-grid.component";
import type {
  BrandPageData,
  ProductFilterConfig,
} from "@/features/products/types/product.type";

interface BrandViewProps {
  brand: BrandPageData;
  filterConfig: ProductFilterConfig;
}

export default function BrandView({ brand, filterConfig }: BrandViewProps) {
  return (
    <div className="container mx-auto px-4 py-8 pt-28">
      <div className="flex flex-col md:flex-row items-center gap-8 mb-12 p-6 rounded-lg shadow-md bg-card">
        <div className="relative w-40 h-40">
          <Image
            src={brand.logo || "/images/placeholder.jpg"}
            alt={brand.name}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 160px"
            priority
          />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold mb-2">{brand.name}</h1>
          {brand.description && (
            <p className="text-muted-foreground mb-4">{brand.description}</p>
          )}
          <p className="text-sm">
            <span className="font-medium">{brand.items.length}</span> products
            available
          </p>
        </div>
      </div>

      <CategoryProductGrid
        items={brand.items}
        contextLabel={brand.name}
        uniqueBrands={filterConfig.uniqueBrands}
        lowestPrice={filterConfig.lowestPrice}
        highestPrice={filterConfig.highestPrice}
      />
    </div>
  );
}
