"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { Star, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [startIndex, setStartIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value > 0 && value <= product.quantity) {
      setQuantity(value);
    }
  };

  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index);
  };

  const nextImages = () => {
    if (startIndex + 4 < product.images.length) {
      setStartIndex(startIndex + 1);
    }
  };

  const previousImages = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (imageRef.current) {
      const { left, top, width, height } =
        imageRef.current.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100;
      const y = ((e.clientY - top) / height) * 100;
      setMousePosition({ x, y });
    }
  };

  const averageRating =
    product.reviews.length > 0
      ? product.reviews.reduce((acc, review) => acc + review.rating, 0) /
        product.reviews.length
      : 0;

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="w-full max-w-[450px]">
            <div
              ref={imageRef}
              className="relative aspect-square rounded-lg overflow-hidden border-4 border-accent cursor-zoom-in"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setScale(1.15)}
              onMouseLeave={() => setScale(1)}
            >
              {product.images[selectedImageIndex] && (
                <div className="relative w-full h-full">
                  <Image
                    src={product.images[selectedImageIndex].url}
                    alt={product.name}
                    fill
                    className="object-contain transition-transform duration-200"
                    style={{
                      transform: scale > 1 ? `scale(${scale})` : "none",
                      transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                    }}
                  />
                </div>
              )}
            </div>

            <div className="relative mt-4">
              {startIndex > 0 && (
                <button
                  onClick={previousImages}
                  className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-1 shadow-md"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
              <div className="grid grid-cols-4 gap-2 px-6">
                {product.images
                  .slice(startIndex, startIndex + 4)
                  .map((image, index) => (
                    <div
                      key={startIndex + index}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer hover:border-primary
                    ${
                      selectedImageIndex === startIndex + index
                        ? "border-primary"
                        : "border-accent"
                    }`}
                      onClick={() => handleImageSelect(startIndex + index)}
                    >
                      <Image
                        src={image.url}
                        alt={`${product.name} ${startIndex + index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
              </div>
              {startIndex + 4 < product.images.length && (
                <button
                  onClick={nextImages}
                  className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-1 shadow-md"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 max-w-[450px]">
          <nav className="text-sm text-gray-600 mb-4">
            Home &gt; {product.category?.name} &gt; {product.name}
          </nav>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <div className="flex items-center mt-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={`h-5 w-5 ${
                  index < Math.round(averageRating)
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="ml-2 text-gray-600">
              {averageRating.toFixed(1)}
            </span>
            <span className="ml-2 text-gray-600">
              ({product.reviews.length} rating
              {product.reviews.length !== 1 ? "s" : ""})
            </span>
          </div>
          {product.brand && (
            <p className="text-gray-600 mt-2">Type: {product.brand.name}</p>
          )}
          <p className="text-2xl font-bold mt-4">${product.price}</p>
          <div className="mt-6">
            <p className="mt-2 text-gray-700">{product.description}</p>
          </div>
          <div className="mt-6">
            <p className="text-gray-600 font-semibold">
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
              className="w-20 border-2 outline-accent text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              className="px-2 py-1 shadow-md border-2 rounded-md border-accent"
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
              className="w-full shadow-md md:w-auto bg-white text-black border-2 border-primary font-bold hover:text-white hover:bg-primary"
              disabled={product.quantity === 0}
            >
              Add to Cart
              <ShoppingCart />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
