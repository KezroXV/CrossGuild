import { HeroSection } from "@/components/HeroSection";
import { Navbar } from "@/components/navbar";
import Reviews from "@/components/reviews";
import { TopSellingGamingGear } from "@/components/TopSellingGamingGear";
import { auth } from "@/lib/auth";
import Offres from "@/components/offres";
import Faqs from "@/components/fasq";
import Footer from "@/components/footer";

export default async function Home() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const session = await auth();

  return (
    <div className="pt-px min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-purple-50/10 dark:to-purple-950/5">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <HeroSection />
        
        {/* Séparateur visuel avec effet de gradient */}
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-8"></div>
        
        <TopSellingGamingGear />
        
        {/* Séparateur visuel */}
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-8"></div>
        
        <Reviews />
        
        {/* Séparateur visuel */}
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-8"></div>
        
        <Offres />
        
        {/* Séparateur visuel */}
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-8"></div>
        
        <Faqs />
      </main>
      <Footer />
    </div>
  );
}
