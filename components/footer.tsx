"use client";

import {
  Footer,
  FooterColumn,
  FooterBottom,
  FooterContent,
} from "@/components/ui/footer";
import crossguild from "@/public/CrossGuild.svg";
import crossguildDark from "@/public/CrossGuild-dark.svg";
import paye from "@/public/paye.svg";
import {
  DiscordLogoIcon,
  InstagramLogoIcon,
  TwitterLogoIcon,
} from "@radix-ui/react-icons";
import Image from "next/image";
import { FaYoutube } from "react-icons/fa";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useTheme } from "next-themes";
import Link from "next/link";

export default function FooterSection() {
  const { theme } = useTheme();

  return (
    <footer className=" w-4/5 mx-auto px-4">
      <div className="max-w-container mx-auto">
        <Footer className="border-t-2 border-primary pt-8">
          <FooterContent className="sm:grid-cols-2 md:grid-cols-3">
            <FooterColumn className="col-span-2 flex-row items-center justify-between gap-8 border-b pb-8 md:col-span-1 md:flex-col md:items-start md:justify-start md:border-b-0">
              <div className="flex items-center gap-2">
                <Image
                  src={theme === "dark" ? crossguildDark : crossguild}
                  alt="CrossGuild"
                  width={40}
                />
                <h3 className="text-xl font-bold">CroosGuild</h3>
              </div>
              <div className="ml-2.5 flex gap-4 sm:ml-0"></div>
            </FooterColumn>
            <FooterColumn>
              <h3 className="text-md  pt-1 font-semibold">Navigation</h3>
              <Link
                href="/categories"
                className="text-muted-foreground hover:text-primary text-sm"
              >
                Categories
              </Link>
              <Link
                href="/products"
                className=" hover:text-primary text-muted-foreground text-sm"
              >
                Products
              </Link>
              <Link
                href="/about"
                className="text-muted-foreground hover:text-primary text-sm"
              >
                About
              </Link>
            </FooterColumn>
            <FooterColumn>
              <h3 className="text-md pt-1 font-semibold">Quick Links</h3>
              <Link
                href="/about"
                className="text-muted-foreground hover:text-primary text-sm"
              >
                About
              </Link>
              <Link
                href="/profile"
                className="text-muted-foreground hover:text-primary text-sm"
              >
                Profile
              </Link>
              <Link
                href="/contact"
                className="text-muted-foreground hover:text-primary text-sm"
              >
                Blog
              </Link>
            </FooterColumn>

            <FooterColumn>
              <h3 className="text-md pt-1 font-semibold">Navigation</h3>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary text-sm"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary text-sm"
              >
                Terms of Service
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary text-sm"
              >
                Cookie Policy
              </Link>
            </FooterColumn>
            <FooterColumn>
              <h3 className="text-md pt-1 font-semibold">Contact</h3>
              <div className="flex items-center gap-4">
                <InstagramLogoIcon className="cursor-pointer" />
                <DiscordLogoIcon className="cursor-pointer" />
                <FaYoutube className="cursor-pointer" />
                <TwitterLogoIcon className="cursor-pointer" />
              </div>
              <div className="flex justify-left items-center">
                <Input
                  type="email"
                  placeholder="Your Email"
                  className="p-2 h-10 w-3/6 bg-white text-lg border border-gray-400 rounded-l-lg rounded-r-none"
                />
                <Button className="p-2 h-10 text-lg bg-accent text-white rounded-r-lg rounded-l-none">
                  Subscribe
                </Button>
              </div>
              <Image src={paye} alt="Paye" width={150} />
            </FooterColumn>
          </FooterContent>
          <FooterBottom className="border-0">
            <div>© 2025 CrossGuild. All rights reserved.</div>
            <div className="flex items-center gap-4">
              <Link href="#" className="cursor-pointer hover:text-primary">
                Privacy Policy
              </Link>
              <Link href="#" className="cursor-pointer hover:text-primary">
                Legal Notice
              </Link>
            </div>
          </FooterBottom>
        </Footer>
      </div>
    </footer>
  );
}
