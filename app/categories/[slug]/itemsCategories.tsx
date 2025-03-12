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
