"use client";
import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  price: number;
  images: { url: string }[];
  slug: string; // Assurez-vous que le slug est inclus ici
};

const SearchBar = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const debouncedSearch = useDebounce(query, 300);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const searchProducts = async () => {
      if (debouncedSearch.length < 2) {
        setProducts([]);
        return;
      }

      try {
        const response = await fetch(`/api/search?q=${debouncedSearch}`);
        const data = await response.json();
        setProducts(data.products);
      } catch (error) {
        console.error("Search failed:", error);
      }
    };

    searchProducts();
  }, [debouncedSearch]);

  const handleSelect = (product: Product) => {
    setQuery("");
    setIsFocused(false);
    router.push(`/product/${product.slug}`);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-xl">
      <div className="flex justify-center items-center">
        <div className="relative w-full">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Search products..."
            className="w-full px-4 py-2 pl-12 text-sm
                       bg-background text-foreground
                       placeholder-muted-foreground rounded-full
                       border border-input
                       focus:border-accent focus:ring-2
                       focus:ring-accent/20 focus:outline-none
                       transition-all duration-300"
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 
                        w-5 h-5 text-muted-foreground"
          />
        </div>
      </div>

      {/* Dropdown Results */}
      <div
        className={cn(
          "absolute w-full mt-2 py-2 bg-background backdrop-blur-sm",
          "rounded-lg border border-input shadow-lg",
          "transition-all duration-200 z-50",
          "overflow-hidden",
          isFocused && query.length >= 2
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4 pointer-events-none"
        )}
      >
        {products.length === 0 && query.length >= 2 ? (
          <div className="px-4 py-2 text-sm text-muted-foreground">
            No results found
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => handleSelect(product)}
                className="flex items-center gap-4 p-3 hover:bg-muted 
                          cursor-pointer transition-colors"
              >
                {product.images[0] && (
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <Image
                      src={product.images[0].url}
                      alt={product.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-foreground font-medium truncate">
                    {product.name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ${product.price.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
