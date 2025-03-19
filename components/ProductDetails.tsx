"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Star } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ProductDetailsProps {
  product: {
    name: string;
    description: string;
    price: number;
    quantity: number;
    images: Array<{ url: string }>;
    brand?: {
      name: string;
    };
    category?: {
      name: string;
    };
    reviews: Array<{
      rating: number;
    }>;
  };
}

const ProductDetails = ({ product }: ProductDetailsProps) => {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value > 0 && value <= product.quantity) {
      setQuantity(value);
    }
  };

  const averageRating =
    product.reviews.length > 0
      ? product.reviews.reduce((acc, review) => acc + review.rating, 0) /
        product.reviews.length
      : 0;

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-1/2">
        <div className="relative aspect-square rounded-lg overflow-hidden border-4 border-accent">
          {product.images[0] && (
            <Image
              src={product.images[0].url}
              alt={product.name}
              fill
              className="object-cover"
            />
          )}
        </div>
        <div className="grid grid-cols-4 gap-2 mt-4">
          {product.images.slice(1).map((image, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden border-4 border-accent"
            >
              <Image
                src={image.url}
                alt={`${product.name} ${index + 2}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="w-full md:w-1/2">
        <nav className="text-sm text-gray-600 mb-4">
          Home &gt; {product.category?.name} &gt; {product.name}
        </nav>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <div className="flex items-center mt-2">
          <Star className="h-5 w-5 text-yellow-500" />
          <span className="ml-2 text-gray-600">{averageRating.toFixed(1)}</span>
          <span className="ml-2 text-gray-600">
            ({product.reviews.length} rating
            {product.reviews.length !== 1 ? "s" : ""})
          </span>
        </div>
        {product.brand && (
          <p className="text-gray-600 mt-2">Type: {product.brand.name}</p>
        )}
        <p className="text-2xl font-semibold mt-4">${product.price}</p>
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Description</h2>
          <p className="mt-2 text-gray-700">{product.description}</p>
        </div>
        <div className="mt-6">
          <p className="text-gray-600">
            Stock: {product.quantity > 0 ? product.quantity : "Out of stock"}
          </p>
        </div>
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Color</h2>
          <div className="flex items-center mt-2">
            <button
              className={`w-8 h-8 rounded-full bg-black ${
                selectedColor === "black" ? "border-2 border-purple-500" : ""
              }`}
              onClick={() => handleColorSelect("black")}
            ></button>
            <button
              className={`w-8 h-8 rounded-full bg-blue-500 ml-2 ${
                selectedColor === "blue" ? "border-2 border-purple-500" : ""
              }`}
              onClick={() => handleColorSelect("blue")}
            ></button>
            <button
              className={`w-8 h-8 rounded-full bg-purple-500 ml-2 ${
                selectedColor === "purple" ? "border-2 border-purple-500" : ""
              }`}
              onClick={() => handleColorSelect("purple")}
            ></button>
          </div>
        </div>
        <div className="mt-6 flex gap-2 items-center">
          <button
            className="px-2 py-1 border-2 rounded-md border-accent"
            onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
          >
            -
          </button>
          <Input
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
            min={1}
            max={product.quantity}
            className="w-20 text-center"
          />
          <button
            className="px-2 py-1 border-2 rounded-md border-accent"
            onClick={() =>
              setQuantity((prev) => Math.min(product.quantity, prev + 1))
            }
          >
            +
          </button>
        </div>
        <div className="mt-8 flex gap-4">
          <Button className="w-full md:w-auto bg-accent text-white">
            Buy It Now
          </Button>
          <Button
            className="w-full  md:w-auto bg-white text-black border-4 border-accent font-bold"
            disabled={product.quantity === 0}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
