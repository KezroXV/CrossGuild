import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link"; // Import Link from Next.js
import { Button } from "./ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "./ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";

const slideFromBottom = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface ProductCardProps {
  item: {
    id: string;
    name: string;
    images: { url: string }[];
    rating: number;
    brand: { name: string };
    price: number;
    quantity: number;
    slug: string; // Ajouter le slug ici
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ item }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleBuyNow = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId: item.id,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const text = await response.text();
      let data;

      try {
        // Tenter de parser le texte en JSON
        data = JSON.parse(text);
      } catch (parseError) {
        console.error("Failed to parse response:", text);
        throw new Error("Invalid server response");
      }

      if (data.success) {
        router.push("/cart");
      } else {
        setError(data.error || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      setError("An error occurred while adding to cart. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      key={item.id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={slideFromBottom}
      transition={{ duration: 0.5 }}
    >
      <Card className="text-center border-4 shadow-md">
        <CardHeader className="pb-0">
          <div className="relative w-full h-[200px] flex items-center justify-center p-4">
            <Image
              src={item.images[0]?.url || "/path/to/default.jpg"}
              alt={item.name}
              fill
              className="object-contain p-2"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          </div>
          <CardTitle className="text-xl text-left font-semibold truncate">
            {item.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pl-6 text-left">
          <div className="flex justify-left items-center my-2">
            {Array.from({ length: 5 }, (_, i) => (
              <span
                key={i}
                className={`text-xl ${
                  i < (item.rating || 0) ? "text-secondary" : "text-gray-300"
                }`}
              >
                ★
              </span>
            ))}
          </div>
          <p className="text-gray-600">{item.brand?.name}</p>
          <p className="text-lg font-bold">{item.price}€</p>
          <p className="text-sm text-gray-500">
            {item.quantity > 0 ? `In Stock: ${item.quantity}` : "Out of Stock"}
          </p>
        </CardContent>
        <CardFooter className="mt-4 flex flex-col justify-center gap-2">
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <div className="flex justify-center gap-2">
            <Button
              className="bg-accent px-4 py-2 text-sm shadow-md"
              onClick={handleBuyNow}
              disabled={isLoading || item.quantity <= 0}
            >
              {isLoading ? "Adding..." : "Buy Now"}
            </Button>
            <Link href={`/product/${item.slug}`}>
              <Button
                variant="outline"
                className="px-4 py-2 border-primary border-2 hover:text-white text-sm shadow-md"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ProductCard;
