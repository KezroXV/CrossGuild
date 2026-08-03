import { HeroSection } from "@/shared/components/HeroSection";
import ReviewTestimonials from "@/features/reviews/components/review-testimonials.component";
import { TopSellingGamingGear } from "@/shared/components/TopSellingGamingGear";
import { auth } from "@/shared/lib/auth";
import Offres from "@/shared/components/offres";
import Faqs from "@/shared/components/fasq";

export default async function HomeView() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const session = await auth();

  return (
    <div className="flex flex-col bg-gradient-to-b from-background via-background to-purple-50/10 dark:to-purple-950/5">
      <HeroSection />

      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-8"></div>

      <TopSellingGamingGear />

      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-8"></div>

      <ReviewTestimonials />

      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-8"></div>

      <Offres />

      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-8"></div>

      <Faqs />
    </div>
  );
}
