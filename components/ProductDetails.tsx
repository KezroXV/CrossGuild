/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect, useTransition } from "react";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Heart,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner"; // Import de Sonner pour les notifications
import { useRouter } from "next/navigation";
import AddToCompareButton from "@/components/AddToCompareButton";
import ProductReviews from "@/components/ProductReviews";
import RelatedProducts from "@/components/RelatedProducts";

interface ProductOption {
  id: string;
  name: string;
  values: string[];
}

interface ProductVariant {
  id: string;
  sku: string;
  price: number;
  quantity: number;
  options: Array<{
    optionId: string;
    value: string;
  }>;
}

interface ProductDetailsProps {
  product: {
    id: string; // ID du produit nécessaire pour l'ajout au panier
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
      id?: string;
    };
    reviews?: Array<{
      rating: number;
    }>;
    options: Array<{
      id: string;
      name: string;
      values: string[];
    }>;
  };
}

const ProductDetails = ({ product }: ProductDetailsProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [startIndex, setStartIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    if (product.options && product.options.length > 0) {
      const defaultOptions: Record<string, string> = {};
      product.options.forEach((option) => {
        if (option.values.length > 0) {
          defaultOptions[option.id] = option.values[0];
        }
      });
      setSelectedOptions(defaultOptions);
    }

    const checkWishlistStatus = async () => {
      try {
        const response = await fetch(
          `/api/wishlist/check?itemId=${product.id}`
        );
        if (response.ok) {
          const data = await response.json();
          setIsInWishlist(data.inWishlist);
        }
      } catch (error) {
        console.error("Error checking wishlist status:", error);
      }
    };

    checkWishlistStatus();
  }, [product.options, product.id]);

  const handleOptionSelect = (optionId: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }));
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
    product.reviews && product.reviews.length > 0
      ? product.reviews.reduce((acc, review) => acc + review.rating, 0) /
        product.reviews.length
      : 0;

  const handleAddToCart = async () => {
    if (product.quantity === 0) {
      toast.error("Ce produit est en rupture de stock");
      return;
    }

    try {
      setIsAddingToCart(true);

      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId: product.id,
          quantity: quantity,
          options: Object.entries(selectedOptions).map(([optionId, value]) => ({
            optionId,
            value,
          })),
        }),
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Échec de l'ajout au panier");
      }

      toast.success(`${product.name} a été ajouté à votre panier`);

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout au panier:", error);
      toast.error(
        error instanceof Error ? error.message : "Échec de l'ajout au panier"
      );
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    try {
      setIsAddingToWishlist(true);

      const method = isInWishlist ? "DELETE" : "POST";
      const url = isInWishlist
        ? `/api/wishlist?itemId=${product.id}`
        : "/api/wishlist";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body:
          method === "POST"
            ? JSON.stringify({ itemId: product.id })
            : undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Failed to ${isInWishlist ? "remove from" : "add to"} wishlist`
        );
      }

      setIsInWishlist(!isInWishlist);
      toast.success(
        isInWishlist
          ? `${product.name} removed from your wishlist`
          : `${product.name} added to your wishlist`
      );

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error(
        `Error ${isInWishlist ? "removing from" : "adding to"} wishlist:`,
        error
      );
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to ${isInWishlist ? "remove from" : "add to"} wishlist`
      );
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  return (
    <>
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
                <button
                  onClick={handleAddToWishlist}
                  disabled={isAddingToWishlist}
                  className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                  aria-label={
                    isInWishlist ? "Remove from wishlist" : "Add to wishlist"
                  }
                  title={
                    isInWishlist ? "Remove from wishlist" : "Add to wishlist"
                  }
                >
                  <Heart
                    className={`h-5 w-5 ${
                      isAddingToWishlist
                        ? "animate-pulse text-accent"
                        : isInWishlist
                          ? "text-accent fill-accent"
                          : "text-gray-400 hover:text-accent"
                    }`}
                    fill={isInWishlist ? "currentColor" : "none"}
                  />
                </button>

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
              {product.reviews && product.reviews.length > 0 && (
                <>
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
                    ({product.reviews.length}{" "}
                    {product.reviews.length === 1 ? "review" : "reviews"})
                  </span>
                </>
              )}
            </div>
            {product.brand && (
              <p className="text-gray-600 mt-2">Type: {product.brand.name}</p>
            )}
            <p className="text-2xl font-bold mt-4">{product.price} DA</p>
            <div className="mt-6">
              <p className="mt-2 text-gray-700">{product.description}</p>
            </div>
            <div className="mt-6">
              <p className="text-gray-600 font-semibold">
                Stock:{" "}
                {product.quantity > 0 ? product.quantity : "Out of stock"}
              </p>
            </div>
            <div className="mt-6">
              {product.options?.map((option) => (
                <div key={option.id} className="mb-4">
                  <h3 className="text-lg font-medium mb-2">{option.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {option.values.map((value) => (
                      <button
                        key={value}
                        onClick={() => handleOptionSelect(option.id, value)}
                        className={`px-4 py-2 rounded-full border-2 transition-colors ${
                          selectedOptions[option.id] === value
                            ? "border-primary bg-primary text-white"
                            : "border-accent hover:border-primary"
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {Object.keys(selectedOptions).length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Selected options:
                </h4>
                <div className="space-y-1">
                  {Object.entries(selectedOptions).map(([optionId, value]) => {
                    const optionName = product.options.find(
                      (o) => o.id === optionId
                    )?.name;
                    return (
                      <div key={optionId} className="flex gap-2 ">
                        <span className="text-gray-600">{optionName}:</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="mt-6 flex gap-2 items-center">
              <button
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                className="px-2 py-1 border-2 rounded-md border-accent"
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
                onClick={() =>
                  setQuantity((prev) => Math.min(product.quantity, prev + 1))
                }
                className="px-2 py-1 shadow-md border-2 rounded-md border-accent"
              >
                +
              </button>
            </div>
            <div className="mb-4">
              <AddToCompareButton product={product} className="mb-2" />
            </div>
            <div className="mt-8 flex gap-4">
              <Button
                className="w-full md:w-auto bg-accent text-white"
                disabled={product.quantity === 0 || isAddingToCart || isPending}
                onClick={async () => {
                  try {
                    setIsAddingToCart(true);
                    // First add to cart
                    const response = await fetch("/api/cart", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        itemId: product.id,
                        quantity: quantity,
                        options: Object.entries(selectedOptions).map(
                          ([optionId, value]) => ({
                            optionId,
                            value,
                          })
                        ),
                      }),
                      cache: "no-store",
                    });

                    if (!response.ok) {
                      const data = await response.json();
                      throw new Error(
                        data.error || "Échec de l'ajout au panier"
                      );
                    }

                    // Then redirect to orders page
                    router.push("/cart");
                  } catch (error) {
                    console.error("Erreur lors de l'achat rapide:", error);
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "Échec de l'achat rapide"
                    );
                  } finally {
                    setIsAddingToCart(false);
                  }
                }}
              >
                {isAddingToCart || isPending ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Achat en cours...
                  </span>
                ) : (
                  "Buy Now"
                )}
              </Button>
              <Button
                className="w-full shadow-md md:w-auto bg-white text-black border-2 border-primary font-bold hover:text-white hover:bg-primary"
                disabled={product.quantity === 0 || isAddingToCart || isPending}
                onClick={handleAddToCart}
              >
                {isAddingToCart || isPending ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Ajout en cours...
                  </span>
                ) : (
                  <>
                    Add to Cart
                    <ShoppingCart className="ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        <ProductReviews productId={product.id} productName={product.name} />
        <RelatedProducts
          productId={product.id}
          categoryId={product.category?.id}
        />
      </div>
    </>
  );
};

export default ProductDetails;
