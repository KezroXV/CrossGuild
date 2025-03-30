"use client";
import { Button } from "@/components/ui/button";
import SearchBar from "./searchBar";
import { ShoppingCart, Heart, Menu, X } from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useState, useEffect } from "react";
import logo from "@/public/CrossGuild.svg";
import {
  Navbar as NavbarUI,
  NavbarLeft,
  NavbarCenter,
  NavbarRight,
} from "@/components/ui/navbar";

export const Navbar = () => {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Effect to fetch cart items count
  useEffect(() => {
    const fetchCartCount = async () => {
      if (session?.user) {
        try {
          // Use the dedicated cart count API endpoint
          const response = await fetch("/api/cart/count");
          if (response.ok) {
            const data = await response.json();
            setCartItemCount(data.count);
          } else {
            setCartItemCount(0);
          }
        } catch (error) {
          console.error("Failed to fetch cart count:", error);
          setCartItemCount(0);
        }
      } else {
        setCartItemCount(0);
      }
    };

    fetchCartCount();

    // Set up interval to refresh cart count when changes might happen
    const intervalId = setInterval(fetchCartCount, 30000);

    return () => clearInterval(intervalId);
  }, [session]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Prevent scrolling when menu is open
    if (!isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  };

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm"
          : "bg-white/60 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <NavbarUI className="h-20 py-0">
          {/* Left Section with Nav Links for Desktop */}
          <NavbarLeft className="md:w-1/3">
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/"
                className="text-gray-800 hover:text-accent font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                href="/categories"
                className="text-gray-800 hover:text-accent font-medium transition-colors"
              >
                Categories
              </Link>
              <Link
                href="/about"
                className="text-gray-800 hover:text-accent font-medium transition-colors"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-gray-800 hover:text-accent font-medium transition-colors"
              >
                Contact
              </Link>
            </div>
          </NavbarLeft>

          {/* Center Section with Logo on both Mobile and Desktop */}
          <NavbarCenter className="flex  items-center md:w-1/3">
            <Link href="/" className="flex items-center justify-center">
              <Image
                src={logo}
                alt="Logo"
                className="cursor-pointer h-14 md:h-16 w-auto"
                priority
                width={160}
                height={60}
              />
            </Link>
          </NavbarCenter>

          {/* Right Section with Cart, Wishlist and User Profile */}
          <NavbarRight className="md:w-1/3 justify-end">
            {/* Mobile buttons */}

            <div className="md:hidden flex items-center space-x-3">
              <Link href="/cart" className="relative">
                <ShoppingCart className="w-6 h-6 text-gray-700" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </span>
                )}
              </Link>
              <button
                onClick={toggleMobileMenu}
                className="text-gray-700 focus:outline-none"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>

            {/* Desktop buttons */}

            <div className="hidden md:flex items-center space-x-5">
              <div className="hidden md:block w-full max-w-md mt-1">
                <SearchBar />
              </div>
              <Link href="/wishlist" className="group">
                <Heart className="w-6 h-6 text-gray-700 group-hover:text-accent transition-colors" />
              </Link>
              <Link href="/cart" className="group relative">
                <ShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-accent transition-colors" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </span>
                )}
              </Link>
              {session?.user ? (
                <div className="relative group">
                  <Image
                    src={session.user.image || "/default-avatar.png"}
                    alt="Profile"
                    width={60}
                    height={60}
                    className="rounded-full cursor-pointer border-2 border-transparent group-hover:border-accent transition-colors"
                  />
                  <div className="absolute right-0 w-48 mt-2 py-2 bg-white rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    {session?.user?.isAdmin && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Admin
                      </Link>
                    )}
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
                    className="bg-accent hover:bg-purple-700 text-white"
                  >
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </NavbarRight>
        </NavbarUI>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-40 pt-20 pb-6 px-6 overflow-y-auto">
          <div className="flex flex-col space-y-6">
            <div className="pt-2 pb-4">
              <SearchBar />
            </div>

            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-lg font-medium text-gray-800 hover:text-accent py-2 border-b border-gray-100"
                onClick={toggleMobileMenu}
              >
                Home
              </Link>
              <Link
                href="/categories"
                className="text-lg font-medium text-gray-800 hover:text-accent py-2 border-b border-gray-100"
                onClick={toggleMobileMenu}
              >
                Categories
              </Link>
              <Link
                href="/about"
                className="text-lg font-medium text-gray-800 hover:text-accent py-2 border-b border-gray-100"
                onClick={toggleMobileMenu}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-lg font-medium text-gray-800 hover:text-accent py-2 border-b border-gray-100"
                onClick={toggleMobileMenu}
              >
                Contact
              </Link>
            </nav>

            <div className="flex items-center justify-between py-4">
              <Link
                href="/wishlist"
                className="flex items-center space-x-2"
                onClick={toggleMobileMenu}
              >
                <Heart className="w-5 h-5 text-gray-700" />
                <span className="text-gray-800 font-medium">Wishlist</span>
              </Link>

              {session?.user ? (
                <div className="flex items-center space-x-3">
                  <Image
                    src={session.user.image || "/default-avatar.png"}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">
                      {session.user.name}
                    </span>
                    <button
                      onClick={() => {
                        signOut();
                        toggleMobileMenu();
                      }}
                      className="text-sm text-accent"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              ) : (
                <Link href="/login" onClick={toggleMobileMenu}>
                  <Button
                    variant="secondary"
                    className="bg-accent hover:bg-purple-700 text-white"
                  >
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
