import { Button } from "@/components/ui/button";
import HeroImg from "@/public/HeroImg.svg";
import Image from "next/image";

export const HeroSection = () => {
  return (
    <section className="relative mt-20 flex flex-col items-center justify-center text-center text-white py-32">
      {/* Image de fond avec overlay */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={HeroImg}
          alt="Hero background"
          fill
          className="object-cover object-center rounded-lg" // Changed className to add rounded corners
          priority
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Contenu texte */}
      <h2 className="italic text-lg">Take Your Gaming to the Next Level</h2>
      <h1 className="text-5xl font-bold leading-tight">
        High-Performance Gaming <br></br>
        <span className="text-purple-500">Accessories</span>
      </h1>
      <p className="mt-4 text-gray-100 max-w-3xl">
        Equip yourself with high-performance gear designed to boost your
        gameplay, offering precision, comfort, and durability for every battle.
      </p>

      {/* Boutons */}
      <div className="mt-6 flex justify-center gap-4">
        <Button className="bg-accent px-6 py-3 text-lg">Shop Now</Button>
        <Button
          variant="outline"
          className="px-6 text-black py-3 text-lg hover:bg-primary hover:text-white border-none"
        >
          New Arrivals!
        </Button>
      </div>
    </section>
  );
};
