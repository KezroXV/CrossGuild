import { Button } from "@/components/ui/button";
import CateImg from "@/public/CateImg.svg";
import Image from "next/image";

export const HeroSection = () => {
  return (
    <section className="relative mt-20 mb-12 flex flex-col items-center justify-center text-center text-white py-32">
      {/* Image de fond avec overlay */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={CateImg}
          alt="Hero background"
          fill
          className="object-cover object-center rounded-lg" // Changed className to add rounded corners
          priority
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Contenu texte */}
      <h1 className="text-5xl font-bold leading-tight">
        Discover the Ultimate <br></br>
        <span className="text-purple-500"> Gaming Gear</span>
      </h1>
      <p className="mt-4 text-gray-100 max-w-3xl">
        Explore top-tier gaming accessories designed to enhance your performance
        and take your gaming to the next level. Find the perfect gear and
        dominate every session.
      </p>

      {/* Boutons */}
      <div className="mt-6 flex justify-center gap-4">
        <Button
          variant="outline"
          className="px-6 border-2 border-primary text-white py-4 text-lg hover:bg-primary bg-transparent hover:text-white shadow-md"
        >
          Explore Categories{" "}
        </Button>
      </div>
    </section>
  );
};

export default HeroSection;
