"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

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
        const response = await fetch("/api/content/hero");
        if (response.ok) {
          const data = await response.json();
          setContent(data);
        }
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
      <div className="min-h-[300px] flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <section className="relative mt-20 flex flex-col items-center justify-center text-center text-white py-32">
      {/* Image de fond avec overlay */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={content.backgroundImage}
          alt="Hero background"
          fill
          className="object-cover object-center rounded-lg"
          priority
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Contenu texte */}
      <h2 className="italic text-lg">{content.tagline}</h2>
      <h1 className="text-5xl font-bold leading-tight">
        {content.heading} <br></br>
        <span className="text-purple-500">{content.highlightedText}</span>
      </h1>
      <p className="mt-4 text-gray-100 max-w-3xl">{content.description}</p>

      {/* Boutons */}
      <div className="mt-6 flex justify-center gap-4">
        <Link href="#top-selling">
          <Button className="bg-accent px-6 py-3 text-lg">
            {content.primaryButtonText}
          </Button>
        </Link>
        <Button
          variant="outline"
          className="px-6 text-white py-3 bg-transparent text-lg hover:bg-primary hover:text-white border-2 border-primary"
        >
          {content.secondaryButtonText}
        </Button>
      </div>
    </section>
  );
};
