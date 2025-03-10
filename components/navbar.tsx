"use client";
import { Button } from "@/components/ui/button";
import SearchBar from "./searchBar";
import { ShoppingCart, Heart, Menu } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState, useEffect } from "react";
import logo from "@/public/CrossGuild.svg";

export const Navbar = () => {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav
      className={`fixed w-full z-50 backdrop-blur-sm transition-shadow ${
        isScrolled ? "shadow-lg bg-opacity-90" : "bg-opacity-50"
      }`}
    >
      <div className="max-w-7xl flex items-center justify-center mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 px-12">
            <Link
              href="/"
              className="text-black-300 hover:text-primary transition"
            >
              Home
            </Link>
            <Link
              href="/categories"
              className="text-black-300 hover:text-primary transition"
            >
              Categories
            </Link>
            <Link
              href="/about"
              className="text-black-300 hover:text-primary transition"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-black-300 hover:text-primary transition"
            >
              Contact
            </Link>
          </div>
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image src={logo} alt="Logo" className="cursor-pointer" />
          </Link>
          {/* Search Bar */}
          <div className="hidden md:flex flex-1 justify-center px-6">
            <SearchBar />
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <Link href="/wishlist">
              <Heart className="w-6 h-6 text-black hover:text-primary transition cursor-pointer" />
            </Link>
            <Link href="/cart">
              <ShoppingCart className="w-6 h-6 text-black hover:text-primary transition cursor-pointer" />
            </Link>
            {session?.user ? (
              <div className="relative group">
                <Image
                  src={session.user.image || "/default-avatar.png"}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="rounded-full cursor-pointer border-2 border-transparent hover:border-purple-500 transition"
                />
                <div className="absolute right-0 w-48 mt-2 py-2 bg-white rounded-md shadow-xl hidden group-hover:block">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/login">
                <Button
                  variant="secondary"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-black hover:text-primary"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-black">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className="block px-3 py-2 text-black hover:text-primary"
            >
              Home
            </Link>
            <Link
              href="/categories"
              className="block px-3 py-2 text-black hover:text-primary"
            >
              Categories
            </Link>
            <Link
              href="/about"
              className="block px-3 py-2 text-black hover:text-primary"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="block px-3 py-2 text-black hover:text-primary"
            >
              Contact
            </Link>
            <div className="px-3 py-2">
              <SearchBar />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
