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
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-12 max-w-7xl mx-auto bg-gradient-to-br from-background via-background to-muted/5 rounded-3xl p-8 shadow-2xl border border-accent/10">
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="w-full max-w-[500px] relative">
            {/* Background decoration */}
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-tr from-accent/10 to-primary/10 rounded-full blur-xl"></div>
            <div
              ref={imageRef}
              className="relative aspect-square rounded-2xl overflow-hidden border-4 border-accent/20 cursor-zoom-in backdrop-blur-sm bg-background/50 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:border-accent/40"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setScale(1.15)}
              onMouseLeave={() => setScale(1)}
            >
              {" "}
              <button
                onClick={handleAddToWishlist}
                disabled={isAddingToWishlist}
                className="absolute top-4 right-4 z-20 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 border border-accent/20 hover:border-accent/40 group"
                aria-label={
                  isInWishlist ? "Remove from wishlist" : "Add to wishlist"
                }
                title={
                  isInWishlist ? "Remove from wishlist" : "Add to wishlist"
                }
              >
                <Heart
                  className={`h-6 w-6 transition-all duration-300 ${
                    isAddingToWishlist
                      ? "animate-pulse text-primary scale-110"
                      : isInWishlist
                        ? "text-primary fill-primary scale-110"
                        : "text-primary hover:text-primary group-hover:scale-110"
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
            </div>{" "}
            <div className="relative mt-6">
              {startIndex > 0 && (
                <button
                  onClick={previousImages}
                  className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 bg-primary/10 hover:bg-primary/20 backdrop-blur-sm rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-primary/30 hover:border-primary/50 group hover:scale-110"
                >
                  <ChevronLeft className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                </button>
              )}
              <div className="grid grid-cols-4 gap-3 px-8">
                {product.images
                  .slice(startIndex, startIndex + 4)
                  .map((image, index) => (
                    <div
                      key={startIndex + index}
                      className={`relative aspect-square rounded-xl overflow-hidden border-3 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg
                      ${
                        selectedImageIndex === startIndex + index
                          ? "border-primary shadow-lg ring-2 ring-primary/30 hover:ring-primary/40"
                          : "border-primary/30 hover:border-primary/60 hover:shadow-primary/20"
                      }`}
                      onClick={() => handleImageSelect(startIndex + index)}
                    >
                      <Image
                        src={image.url}
                        alt={`${product.name} ${startIndex + index + 1}`}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-110"
                      />
                      {selectedImageIndex === startIndex + index && (
                        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
              {startIndex + 4 < product.images.length && (
                <button
                  onClick={nextImages}
                  className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 bg-primary/10 hover:bg-primary/20 backdrop-blur-sm rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-primary/30 hover:border-primary/50 group hover:scale-110"
                >
                  <ChevronRight className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                </button>
              )}
            </div>
            {/* Options and Quantity Cards */}
            <div className="mt-8 space-y-4">
              {/* Quantity Card */}
              <div className="bg-gradient-to-r from-muted/50 to-muted/30 backdrop-blur-sm rounded-2xl p-6 border border-accent/10">
                <h3 className="text-lg font-bold text-foreground flex items-center mb-4">
                  <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                  Quantity
                </h3>
                <div className="flex gap-2 items-center">
                  {" "}
                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="w-10 h-10 bg-primary/10 hover:bg-primary/20 border-2 border-primary/30 hover:border-primary/50 rounded-lg transition-all duration-300 flex items-center justify-center group hover:scale-105"
                  >
                    <span className="text-lg font-bold text-primary group-hover:scale-110 transition-transform">
                      −
                    </span>
                  </button>{" "}
                  <Input
                    type="number"
                    value={quantity}
                    onChange={handleQuantityChange}
                    min={1}
                    max={product.quantity}
                    className="w-20 h-10 text-center text-lg font-bold border-2 border-primary/30 hover:border-primary/50 focus:border-primary rounded-lg bg-background/80 hover:bg-background transition-all duration-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    onClick={() =>
                      setQuantity((prev) =>
                        Math.min(product.quantity, prev + 1)
                      )
                    }
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

              {/* Options Cards */}
              {product.options?.map((option) => (
                <div key={option.id}>
                  <div className="bg-gradient-to-r from-muted/50 to-muted/30 backdrop-blur-sm rounded-2xl p-6 border border-accent/10">
                    <h3 className="text-lg font-bold text-foreground flex items-center mb-4">
                      <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                      {option.name}
                    </h3>{" "}
                    <div className="flex flex-wrap gap-3">
                      {option.values.map((value) => (
                        <button
                          key={value}
                          onClick={() => handleOptionSelect(option.id, value)}
                          className={`relative px-6 py-3 rounded-xl border-2 font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg group ${
                            selectedOptions[option.id] === value
                              ? "border-primary bg-primary/20 text-primary shadow-lg shadow-primary/25 hover:shadow-primary/30 hover:bg-primary/30"
                              : "border-primary/30 bg-primary/10 hover:border-primary/50 hover:bg-primary/20 text-foreground hover:text-primary"
                          }`}
                        >
                          {selectedOptions[option.id] === value && (
                            <div className="absolute inset-0 bg-primary/10 rounded-xl blur-lg"></div>
                          )}
                          <span className="relative">{value}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>{" "}
        <div className="w-full md:w-1/2 max-w-[500px] relative">
          {/* Background decoration */}
          <div className="absolute -top-6 -right-6 w-40 h-40 bg-gradient-to-bl from-accent/5 to-primary/5 rounded-full blur-3xl"></div>{" "}
          <nav className="text-sm text-muted-foreground mb-6 bg-muted/20 px-4 py-2 rounded-full inline-block backdrop-blur-sm border border-accent/10">
            <span className="hover:text-accent transition-colors cursor-pointer">
              Home
            </span>
            <span className="mx-2">›</span>
            <span className="hover:text-accent transition-colors cursor-pointer">
              {product.category?.name || "Category"}
            </span>
            <span className="mx-2">›</span>
            <span className="text-foreground font-medium">{product.name}</span>
          </nav>
          <div className="relative z-10">
            <h1 className="text-4xl font-black bg-gradient-to-r from-foreground via-foreground to-accent bg-clip-text text-transparent leading-tight mb-4">
              {product.name}
            </h1>
            <div className="flex items-center mt-4 mb-6">
              {product.reviews && product.reviews.length > 0 && (
                <div className="flex items-center bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 px-4 py-2 rounded-full border border-yellow-200 dark:border-yellow-800">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`h-5 w-5 transition-all duration-200 ${
                        index < Math.round(averageRating)
                          ? "text-yellow-500 fill-yellow-500 drop-shadow-sm"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-3 text-sm font-bold text-yellow-700 dark:text-yellow-300">
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({product.reviews.length}{" "}
                    {product.reviews.length === 1 ? "review" : "reviews"})
                  </span>
                </div>
              )}
            </div>
            {product.brand && (
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                  <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                  {product.brand.name}
                </span>
              </div>
            )}
            <div className="mb-6">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-primary/20 rounded-2xl blur-lg"></div>
                <p className="relative text-4xl font-black bg-gradient-to-r from-accent via-accent to-primary bg-clip-text text-transparent px-6 py-3">
                  {product.price} DA
                </p>
              </div>
            </div>
            <div className="mb-8">
              <div className="bg-muted/30 backdrop-blur-sm rounded-2xl p-6 border border-accent/10">
                <h3 className="text-lg font-semibold mb-3 text-foreground">
                  Description
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${product.quantity > 0 ? "bg-green-500" : "bg-red-500"}`}
                  ></div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Stock:
                  </span>
                </div>
                <span
                  className={`font-bold px-3 py-1 rounded-full text-sm ${
                    product.quantity > 0
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {product.quantity > 0
                    ? `${product.quantity} available`
                    : "Out of stock"}
                </span>{" "}
              </div>
            </div>{" "}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button
                className="flex-1 bg-primary text-primary-foreground font-bold py-4 px-8 rounded-lg hover:bg-primary/90 transition-colors"
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
                <div className="flex items-center justify-center">
                  {isAddingToCart || isPending ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center font-bold text-lg">
                      🚀 Buy Now
                    </span>
                  )}
                </div>
              </Button>
              <Button
                variant="outline"
                className="flex-1 font-bold py-4 px-8 rounded-lg"
                disabled={product.quantity === 0 || isAddingToCart || isPending}
                onClick={handleAddToCart}
              >
                <div className="flex items-center justify-center">
                  {isAddingToCart || isPending ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5"
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
                      Adding...
                    </span>
                  ) : (
                    <div className="flex items-center font-bold text-lg">
                      <ShoppingCart className="mr-3 h-5 w-5" />
                      Add to Cart
                    </div>
                  )}
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16">
        <ProductReviews productId={product.id} productName={product.name} />
      </div>

      {/* Related Products Section */}
      <div className="mt-16">
        <RelatedProducts />
      </div>
    </div>
  );
};

export default ProductDetails;
