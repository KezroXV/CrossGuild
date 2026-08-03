import { CategoryProductGrid } from "@/features/products/components/category-product-grid.component";
import type {
  CategoryPageData,
  ProductFilterConfig,
} from "@/features/products/types/product.type";

interface CategoryViewProps {
  category: CategoryPageData;
  filterConfig: ProductFilterConfig;
}

export default function CategoryView({
  category,
  filterConfig,
}: CategoryViewProps) {
  if (!category.items.length) {
    return (
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="text-center">
          <p>No items found in this category.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-28">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{category.name}</h1>
        {category.description && (
          <p className="text-gray-600 mt-2">{category.description}</p>
        )}
      </div>

      <CategoryProductGrid
        items={category.items}
        contextLabel={category.name}
        uniqueBrands={filterConfig.uniqueBrands}
        lowestPrice={filterConfig.lowestPrice}
        highestPrice={filterConfig.highestPrice}
      />
    </div>
  );
}
