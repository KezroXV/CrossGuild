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
    <div className="pt-px min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col gap-8">
        <HeroSection />
        <TopSellingGamingGear />
        <Reviews />
        <Offres />
        <Faqs />
      </main>
      <Footer />
    </div>
  );
}
