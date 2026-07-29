import { CategoryProductGrid } from "@/features/products/components/category-product-grid.component";
import type {
  ProductFilterConfig,
  ProductListItem,
} from "@/features/products/types/product.type";

interface ProductsViewProps {
  items: ProductListItem[];
  filterConfig: ProductFilterConfig;
}

export default function ProductsView({ items, filterConfig }: ProductsViewProps) {
  return (
    <div className="container mx-auto px-4 py-8 pt-28">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">All Products</h1>
        <p className="text-gray-600 mt-2">
          Discover our complete collection of products
        </p>
      </div>

      <CategoryProductGrid
        items={items}
        contextLabel="All Products"
        uniqueBrands={filterConfig.uniqueBrands}
        uniqueCategories={filterConfig.uniqueCategories}
        lowestPrice={filterConfig.lowestPrice}
        highestPrice={filterConfig.highestPrice}
        variant="all-products"
      />
    </div>
  );
}
