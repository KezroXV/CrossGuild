"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface CategoryHeroContent {
  id: string;
  heading: string;
  highlightedText: string;
  description: string;
  buttonText: string;
  backgroundImage: string;
}

const HeroSection = () => {
  const [content, setContent] = useState<CategoryHeroContent>({
    id: "",
    heading: "Discover the Ultimate",
    highlightedText: "Gaming Gear",
    description:
      "Explore top-tier gaming accessories designed to enhance your performance and take your gaming to the next level. Find the perfect gear and dominate every session.",
    buttonText: "Explore Categories",
    backgroundImage: "/CateImg.svg",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch("/api/content/category-hero");
        if (response.ok) {
          const data = await response.json();
          setContent(data);
        }
      } catch (error) {
        console.error("Failed to fetch category hero content:", error);
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
    <section className="relative mt-20 mb-12 flex flex-col items-center justify-center text-center text-white py-32">
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
      <h1 className="text-5xl font-bold leading-tight">
        {content.heading} <br></br>
        <span className="text-purple-500">{content.highlightedText}</span>
      </h1>
      <p className="mt-4 text-gray-100 max-w-3xl">{content.description}</p>

      {/* Boutons */}
      <div className="mt-6 flex justify-center gap-4">
        <Link href="#categories">
          <Button
            variant="outline"
            className="px-6 border-2 border-primary text-white py-4 text-lg hover:bg-primary bg-transparent hover:text-white shadow-md"
          >
            {content.buttonText}
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;
