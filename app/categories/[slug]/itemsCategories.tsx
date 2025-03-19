"use client";
import React from "react";
import ProductCard from "@/components/ProductCard";

interface CategoryItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  images: { url: string }[];
  brand?: {
    name: string;
  };
  slug: string;
  rating?: number;
}

interface ItemsCategoriesProps {
  items: CategoryItem[];
}

const slideFromBottom = {
  hidden: { opacity: 0, y: 100 },
  visible: { opacity: 1, y: 0 },
};

const ItemsCategories = ({ items }: ItemsCategoriesProps) => {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {items.map((item) => (
        <ProductCard key={item.id} item={item} />
      ))}
    </div>
  );
};

export default ItemsCategories;
