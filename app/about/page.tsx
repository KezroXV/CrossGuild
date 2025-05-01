import {
  Item,
  ItemIcon,
  ItemTitle,
  ItemDescription,
} from "@/components/ui/item";
import {
  Gamepad2,
  CheckCircle2,
  Truck,
  Users,
  Sparkles,
  GaugeCircle,
  UsersRound,
  HeartHandshake,
} from "lucide-react";
import Image from "next/image";
import { Navbar } from "@/components/navbar";
import Faqs from "@/components/fasq";
import Footer from "@/components/footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      {/* Hero Section */}
      <section className="mt-20 relative w-full h-[380px] md:h-[420px] flex items-center justify-center">
        <Image
          src="/about-bg.png"
          alt="Gaming keyboard background"
          fill
          className="object-cover object-center brightness-[.55]"
          priority
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <span className="text-accent font-medium text-sm md:text-base mb-2 tracking-widest uppercase">
            Level Up Your Game
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            CrossGuild Store
          </h1>
          <a
            href="#mission"
            className="inline-block text-white px-6 py-2 rounded-md bg-accent text-accent-foreground font-semibold shadow hover:bg-accent/90 transition"
          >
            Learn More About CrossGuild
          </a>
        </div>
      </section>

      {/* How We Make Gaming Better */}
      <section className="bg-background py-12 px-4">
        <h2 className="text-center text-accent font-semibold text-sm md:text-base mb-10 tracking-widest uppercase">
          How We Make Gaming Better
        </h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-0 max-w-4xl mx-auto">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center flex-1">
            <div className="bg-accent/20 rounded-full p-3 mb-3">
              <Gamepad2 className="w-7 h-7 text-accent" />
            </div>
            <div className="font-semibold text-lg mb-1">CrossGuild Store</div>
            <div className="text-muted-foreground text-sm max-w-[220px]">
              We test and guarantee each product to ensure top performance and
              durability
            </div>
          </div>
          {/* Arrow */}
          <div className="hidden md:flex flex-col items-center mx-2">
            <div className="w-12 h-1 bg-accent rounded-full mt-8" />
            <div className="w-0 h-0 border-t-8 border-t-accent border-x-8 border-x-transparent" />
          </div>
          {/* Step 2 */}
          <div className="flex flex-col items-center text-center flex-1">
            <div className="bg-background border-2 border-accent rounded-full p-3 mb-3">
              <CheckCircle2 className="w-7 h-7 text-accent" />
            </div>
            <div className="font-semibold text-lg mb-1">
              Quality Gear You Can Trust
            </div>
            <div className="text-muted-foreground text-sm max-w-[220px]">
              We test and guarantee each product to ensure top performance and
              durability.
            </div>
          </div>
          {/* Arrow */}
          <div className="hidden md:flex flex-col items-center mx-2">
            <div className="w-12 h-1 bg-accent rounded-full mt-8" />
            <div className="w-0 h-0 border-t-8 border-t-accent border-x-8 border-x-transparent" />
          </div>
          {/* Step 3 */}
          <div className="flex flex-col items-center text-center flex-1">
            <div className="bg-background border-2 border-accent rounded-full p-3 mb-3">
              <Truck className="w-7 h-7 text-accent" />
            </div>
            <div className="font-semibold text-lg mb-1">
              Fast & Secure Delivery
            </div>
            <div className="text-muted-foreground text-sm max-w-[220px]">
              Get your orders swiftly and securely with our trusted shipping
              partners.
            </div>
          </div>
          {/* Arrow */}
          <div className="hidden md:flex flex-col items-center mx-2">
            <div className="w-12 h-1 bg-accent rounded-full mt-8" />
            <div className="w-0 h-0 border-t-8 border-t-accent border-x-8 border-x-transparent" />
          </div>
          {/* Step 4 */}
          <div className="flex flex-col items-center text-center flex-1">
            <div className="bg-background border-2 border-accent rounded-full p-3 mb-3">
              <Users className="w-7 h-7 text-accent" />
            </div>
            <div className="font-semibold text-lg mb-1">Join the Community</div>
            <div className="text-muted-foreground text-sm max-w-[220px]">
              Connect with fellow gamers, access exclusive content, and stay
              updated on gaming trends.
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section id="mission" className="py-14 px-4 bg-background">
        <h2 className="text-center text-accent font-semibold text-sm md:text-base mb-3 tracking-widest uppercase">
          Our Mission
        </h2>
        <h3 className="text-center text-2xl md:text-3xl font-bold mb-5">
          By Gamers, For Gamers
        </h3>
        <p className="text-center max-w-2xl mx-auto text-muted-foreground mb-10">
          We’re a team of passionate gamers and tech enthusiasts who understand
          the importance of high-performance gear. Our mission is simple: to
          bring the best in gaming equipment to every gamer, from casual players
          to competitive pros. We know what it takes to level up your gaming
          experience, and we’re here to make sure you have the tools to do it.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 border-2 border-accent rounded-2xl overflow-hidden max-w-5xl mx-auto divide-y-2 md:divide-y-0 md:divide-x-2 divide-accent bg-white">
          {/* By Gamers, For Gamers */}
          <Item className="flex flex-col items-center justify-center text-center h-full p-8">
            <div className="flex items-center justify-center mb-3 gap-3">
              <Sparkles className="w-7 h-7 text-accent" />
              <span className="text-xl font-bold text-foreground">
                By Gamers, For Gamers
              </span>
            </div>
            <div className="text-muted-foreground text-base text-center">
              We believe that every gamer deserves reliable, top-quality gear.
              Our team tests every product rigorously to ensure it meets the
              standards we would expect ourselves. If it doesn’t impress us, it
              won’t make it to you.
            </div>
          </Item>
          {/* Innovation & Performance */}
          <Item className="flex flex-col items-center justify-center text-center h-full p-8">
            <div className="flex items-center justify-center mb-3 gap-3">
              <GaugeCircle className="w-7 h-7 text-accent" />
              <span className="text-xl font-bold text-foreground">
                Innovation & Performance
              </span>
            </div>
            <div className="text-muted-foreground text-base text-center">
              The gaming world never stops evolving, and neither do we. We stay
              at the forefront of technology, continuously updating our catalog
              to bring you the latest innovations and performance-enhancing
              equipment.
            </div>
          </Item>
          {/* Community Focus */}
          <Item className="flex flex-col items-center justify-center text-center h-full p-8">
            <div className="flex items-center justify-center mb-3 gap-3">
              <UsersRound className="w-7 h-7 text-accent" />
              <span className="text-xl font-bold text-foreground">
                Community Focus
              </span>
            </div>
            <div className="text-muted-foreground text-base text-center">
              Gaming is more than a hobby; it’s a lifestyle. We’re dedicated to
              building a supportive and inclusive gaming community where
              everyone feels welcome.
            </div>
          </Item>
          {/* Commitment to Gamers */}
          <Item className="flex flex-col items-center justify-center text-center h-full p-8">
            <div className="flex items-center justify-center mb-3 gap-3">
              <HeartHandshake className="w-7 h-7 text-accent" />
              <span className="text-xl font-bold text-foreground">
                Commitment to Gamers
              </span>
            </div>
            <div className="text-muted-foreground text-base text-center">
              Gaming is more than a hobby; it’s a lifestyle. We’re dedicated to
              building a supportive and inclusive gaming community where
              everyone feels welcome.
            </div>
          </Item>
        </div>
      </section>
      <Faqs />
      <Footer />
    </div>
  );
}
