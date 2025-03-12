import React from "react";
import CardItem from "@/components/carditem";

interface CategoryItem {
  id: string;
  name: string;
  price: number;
  images: { url: string }[];
  brand?: { name: string };
  slug: string;
}

interface ItemsCategoriesProps {
  items: CategoryItem[];
}

const ItemsCategories = ({ items }: ItemsCategoriesProps) => {
  console.log("ItemsCategories received items:", items);

  if (!items || !Array.isArray(items) || items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          Aucun produit disponible dans cette catégorie.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {items.map((item) => (
        <CardItem
          key={item.id}
          product={item}
          variant="category"
          showRating={false}
          animate={true}
        />
      ))}
    </div>
  );
};

export default ItemsCategories;
