"use client";
import { Button } from "@/shared/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchHeroContent } from "@/features/cms/services/cms.service";

interface HeroContent {
  id: string;
  tagline: string;
  heading: string;
  highlightedText: string;
  description: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  backgroundImage: string;
}

export const HeroSection = () => {
  const [content, setContent] = useState<HeroContent>({
    id: "",
    tagline: "Take Your Gaming to the Next Level",
    heading: "High-Performance Gaming",
    highlightedText: "Accessories",
    description:
      "Equip yourself with high-performance gear designed to boost your gameplay, offering precision, comfort, and durability for every battle.",
    primaryButtonText: "Shop Now",
    secondaryButtonText: "New Arrivals!",
    backgroundImage: "/HeroImg.svg",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await fetchHeroContent();
        setContent(data);
      } catch (error) {
        console.error("Failed to fetch hero content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="relative mt-20 flex flex-col items-center justify-center text-center py-32 bg-muted/30 rounded-lg animate-pulse">
        <div className="h-8 w-64 bg-muted rounded mb-4"></div>
        <div className="h-16 w-96 bg-muted rounded mb-4"></div>
        <div className="h-24 w-full max-w-3xl bg-muted rounded mb-6"></div>
        <div className="flex gap-4">
          <div className="h-12 w-32 bg-muted rounded"></div>
          <div className="h-12 w-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <section className="relative mt-20 flex flex-col items-center justify-center text-center text-white py-32 md:py-40 overflow-hidden min-h-[600px] md:min-h-[700px]">
      {/* Image de fond avec overlay amélioré */}
      <div className="absolute inset-0 -z-10 rounded-lg">
        <Image
          src={content.backgroundImage}
          alt="Hero background"
          fill
          className="object-cover object-center rounded-lg transition-transform duration-700 hover:scale-105"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80 rounded-lg"></div>
        {/* Effet de lumière ambiante */}
        <div className="absolute inset-0 bg-gradient-radial from-purple-500/20 via-transparent to-transparent opacity-50 rounded-lg"></div>
      </div>

      {/* Contenu texte avec animations */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="italic text-base md:text-lg text-purple-300 tracking-wide"
      >
        {content.tagline}
      </motion.h2>
      
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mt-4 px-4"
      >
        {content.heading}
        <br />
        <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
          {content.highlightedText}
        </span>
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-6 text-gray-200 max-w-3xl px-4 text-sm md:text-base leading-relaxed"
      >
        {content.description}
      </motion.p>

      {/* Boutons avec animations améliorées */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="mt-8 flex flex-col sm:flex-row justify-center gap-4 px-4"
      >
        <Link href="#top-selling">
          <Button className="bg-accent hover:bg-accent/90 px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl hover:shadow-accent/50 transition-all duration-300 hover:scale-105 group">
            {content.primaryButtonText}
            <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
          </Button>
        </Link>
        <Link href={"/products"}>
          <Button
            variant="outline"
            className="px-8 text-white py-6 bg-transparent/10 backdrop-blur-sm text-lg font-semibold hover:bg-primary hover:text-white border-2 border-primary hover:border-primary shadow-lg hover:shadow-xl hover:shadow-primary/50 transition-all duration-300 hover:scale-105"
          >
            {content.secondaryButtonText}
          </Button>
        </Link>
      </motion.div>
    </section>
  );
};
