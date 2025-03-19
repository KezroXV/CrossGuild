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

const ProductCard: React.FC<ProductCardProps> = ({ item }) => (
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
      <CardFooter className="mt-4 flex justify-center gap-2">
        <Button className="bg-accent px-4 py-2 text-sm shadow-md">
          Buy Now
        </Button>
        <Link href={`/product/${item.slug}`}>
          <Button
            variant="outline"
            className="px-4 py-2 border-primary border-2 hover:text-white text-sm shadow-md"
          >
            Learn More
          </Button>
        </Link>
      </CardFooter>
    </Card>
  </motion.div>
);

export default ProductCard;
