import { HeroSection } from "@/components/HeroSection";
import { Navbar } from "@/components/navbar";
import Reviews from "@/components/reviews";
import { TopSellingGamingGear } from "@/components/TopSellingGamingGear";
import { auth } from "@/lib/auth";
import Image from "next/image";
import Offres from "@/components/offres";
export default async function Home() {
  const session = await auth();

  return (
    <div className="pt-4">
      <Navbar />
      <HeroSection />
      <TopSellingGamingGear></TopSellingGamingGear>
      <Reviews />
      <Offres />
    </div>
  );
}
