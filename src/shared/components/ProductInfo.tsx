import { motion } from "framer-motion";
import Image from "next/image";
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
    description?: string;
  };
  showFullDetails?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  item,
  showFullDetails = false,
}) => {
  if (!item) return null; // Ensure item is defined

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
          <div
            className={`relative w-full ${
              showFullDetails ? "h-[400px]" : "h-[200px]"
            } flex items-center justify-center p-4`}
          >
            {" "}
            <Image
              src={
                item.images?.length > 0
                  ? item.images[0].url
                  : "/images/placeholder-product.svg"
              }
              alt={item.name}
              fill
              className="object-contain p-2"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== "/images/placeholder-product.svg") {
                  target.src = "/images/placeholder-product.svg";
                }
              }}
            />
          </div>
          <CardTitle
            className={`${
              showFullDetails ? "text-2xl" : "text-xl"
            } text-left font-semibold truncate`}
          >
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
          <div className="flex items-center">
            <p className="text-lg font-bold">{item.price}€</p>
          </div>
          <p className="text-sm text-gray-500">
            {item.quantity > 0 ? `In Stock: ${item.quantity}` : "Out of Stock"}
          </p>
          <div className="flex items-center mt-2">
            <span className="mr-2">Color:</span>
            <div className="flex space-x-2">
              <span className="w-6 h-6 bg-black rounded-full border"></span>
              <span className="w-6 h-6 bg-blue-500 rounded-full border"></span>
              <span className="w-6 h-6 bg-purple-500 rounded-full border"></span>
            </div>
          </div>
        </CardContent>
        {showFullDetails && (
          <div className="px-6 py-4">
            <p className="text-gray-700">{item.description}</p>
          </div>
        )}
        <CardFooter className="mt-4 flex justify-center gap-2">
          <Button className="bg-accent px-4 py-2 text-sm shadow-md">
            Buy It Now
          </Button>
          <Button
            variant="outline"
            className="px-4 py-2 border-primary border-2 hover:text-white text-sm shadow-md"
          >
            Add To Cart
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ProductCard;
