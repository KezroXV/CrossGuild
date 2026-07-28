import { HeroSection } from "@/shared/components/HeroSection";
import { Navbar } from "@/shared/components/navbar";
import Reviews from "@/shared/components/reviews";
import { TopSellingGamingGear } from "@/shared/components/TopSellingGamingGear";
import { auth } from "@/shared/lib/auth";
import Offres from "@/shared/components/offres";
import Faqs from "@/shared/components/fasq";
import Footer from "@/shared/components/footer";

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
