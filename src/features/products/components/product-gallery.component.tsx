"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import type { ProductDetailItem } from "@/features/products/types/product.type";

interface ProductGalleryProps {
  product: Pick<ProductDetailItem, "name" | "images" | "quantity" | "options">;
  quantity: number;
  onQuantityChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onQuantityDecrease: () => void;
  onQuantityIncrease: () => void;
  selectedOptions: Record<string, string>;
  onOptionSelect: (optionId: string, value: string) => void;
}

export default function ProductGallery({
  product,
  quantity,
  onQuantityChange,
  onQuantityDecrease,
  onQuantityIncrease,
  selectedOptions,
  onOptionSelect,
}: ProductGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [startIndex, setStartIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (imageRef.current) {
      const { left, top, width, height } =
        imageRef.current.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100;
      const y = ((e.clientY - top) / height) * 100;
      setMousePosition({ x, y });
    }
  };

  return (
    <div className="w-full max-w-[500px] relative">
      <div className="absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-tr from-accent/10 to-primary/10 rounded-full blur-xl" />

      <div
        ref={imageRef}
        className="relative aspect-square rounded-2xl overflow-hidden border-4 border-accent/20 cursor-zoom-in backdrop-blur-sm bg-background/50 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:border-accent/40"
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

      <div className="relative mt-6">
        {startIndex > 0 && (
          <button
            onClick={() => setStartIndex((prev) => prev - 1)}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 bg-primary/10 hover:bg-primary/20 backdrop-blur-sm rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-primary/30 hover:border-primary/50 group hover:scale-110"
          >
            <ChevronLeft className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
          </button>
        )}
        <div className="grid grid-cols-4 gap-3 px-8">
          {product.images.slice(startIndex, startIndex + 4).map((image, index) => {
            const imageIndex = startIndex + index;
            return (
              <div
                key={imageIndex}
                className={`relative aspect-square rounded-xl overflow-hidden border-3 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  selectedImageIndex === imageIndex
                    ? "border-primary shadow-lg ring-2 ring-primary/30 hover:ring-primary/40"
                    : "border-primary/30 hover:border-primary/60 hover:shadow-primary/20"
                }`}
                onClick={() => setSelectedImageIndex(imageIndex)}
              >
                <Image
                  src={image.url}
                  alt={`${product.name} ${imageIndex + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-110"
                />
                {selectedImageIndex === imageIndex && (
                  <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {startIndex + 4 < product.images.length && (
          <button
            onClick={() => setStartIndex((prev) => prev + 1)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 bg-primary/10 hover:bg-primary/20 backdrop-blur-sm rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-primary/30 hover:border-primary/50 group hover:scale-110"
          >
            <ChevronRight className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
          </button>
        )}
      </div>

      <div className="mt-8 space-y-4">
        <div className="bg-gradient-to-r from-muted/50 to-muted/30 backdrop-blur-sm rounded-2xl p-6 border border-accent/10">
          <h3 className="text-lg font-bold text-foreground flex items-center mb-4">
            <div className="w-2 h-2 bg-accent rounded-full mr-3" />
            Quantity
          </h3>
          <div className="flex gap-2 items-center">
            <button
              onClick={onQuantityDecrease}
              className="w-10 h-10 bg-primary/10 hover:bg-primary/20 border-2 border-primary/30 hover:border-primary/50 rounded-lg transition-all duration-300 flex items-center justify-center group hover:scale-105"
            >
              <span className="text-lg font-bold text-primary group-hover:scale-110 transition-transform">
                −
              </span>
            </button>
            <Input
              type="number"
              value={quantity}
              onChange={onQuantityChange}
              min={1}
              max={product.quantity}
              className="w-20 h-10 text-center text-lg font-bold border-2 border-primary/30 hover:border-primary/50 focus:border-primary rounded-lg bg-background/80 hover:bg-background transition-all duration-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              onClick={onQuantityIncrease}
              className="w-10 h-10 bg-primary/10 hover:bg-primary/20 border-2 border-primary/30 hover:border-primary/50 rounded-lg transition-all duration-300 flex items-center justify-center group hover:scale-105"
            >
              <span className="text-lg font-bold text-primary group-hover:scale-110 transition-transform">
                +
              </span>
            </button>
            <span className="ml-4 text-sm text-muted-foreground">
              Max: {product.quantity}
            </span>
          </div>
        </div>

        {product.options.map((option) => (
          <div
            key={option.id}
            className="bg-gradient-to-r from-muted/50 to-muted/30 backdrop-blur-sm rounded-2xl p-6 border border-accent/10"
          >
            <h3 className="text-lg font-bold text-foreground flex items-center mb-4">
              <div className="w-2 h-2 bg-accent rounded-full mr-3" />
              {option.name}
            </h3>
            <div className="flex flex-wrap gap-3">
              {option.values.map((value) => (
                <button
                  key={value}
                  onClick={() => onOptionSelect(option.id, value)}
                  className={`relative px-6 py-3 rounded-xl border-2 font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg group ${
                    selectedOptions[option.id] === value
                      ? "border-primary bg-primary/20 text-primary shadow-lg shadow-primary/25 hover:shadow-primary/30 hover:bg-primary/30"
                      : "border-primary/30 bg-primary/10 hover:border-primary/50 hover:bg-primary/20 text-foreground hover:text-primary"
                  }`}
                >
                  {selectedOptions[option.id] === value && (
                    <div className="absolute inset-0 bg-primary/10 rounded-xl blur-lg" />
                  )}
                  <span className="relative">{value}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
