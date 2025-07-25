"use client";
import { Button } from "@/components/ui/button";
import SearchBar from "./searchBar";
import { ShoppingCart, Heart, Menu, X } from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import logo from "@/public/CrossGuild.svg";
import logoDark from "@/public/CrossGuild-dark.svg";
import {
  Navbar as NavbarUI,
  NavbarLeft,
  NavbarCenter,
  NavbarRight,
} from "@/components/ui/navbar";
import { ModeToggle } from "@/components/ui/mode-toggle";
import SafeAvatar from "@/components/SafeAvatar";

export const Navbar = () => {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [wishlistItemCount, setWishlistItemCount] = useState(0);
  const { theme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Effect to fetch cart and wishlist items count
  useEffect(() => {
    const fetchCounts = async () => {
      if (session?.user) {
        try {
          // Fetch cart count
          const cartResponse = await fetch("/api/cart/count");
          if (cartResponse.ok) {
            const cartData = await cartResponse.json();
            setCartItemCount(cartData.count);
          } else {
            setCartItemCount(0);
          }

          // Fetch wishlist count
          const wishlistResponse = await fetch("/api/wishlist/count");
          if (wishlistResponse.ok) {
            const wishlistData = await wishlistResponse.json();
            setWishlistItemCount(wishlistData.count);
          } else {
            setWishlistItemCount(0);
          }
        } catch (error) {
          console.error("Failed to fetch counts:", error);
          setCartItemCount(0);
          setWishlistItemCount(0);
        }
      } else {
        setCartItemCount(0);
        setWishlistItemCount(0);
      }
    };

    fetchCounts();

    // Set up interval to refresh counts when changes might happen
    const intervalId = setInterval(fetchCounts, 30000);

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
          ? "bg-background/80 backdrop-blur-md shadow-sm"
          : "bg-background/60 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <NavbarUI className="h-20 py-0">
          {/* Left Section with Nav Links for Desktop */}
          <NavbarLeft className="md:w-1/3">
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/"
                className="text-foreground hover:text-accent font-medium transition-colors"
              >
                Home
              </Link>{" "}
              <Link
                href="/categories"
                className="text-foreground hover:text-accent font-medium transition-colors"
              >
                Categories
              </Link>
              <Link
                href="/about"
                className="text-foreground hover:text-accent font-medium transition-colors"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-foreground hover:text-accent font-medium transition-colors"
              >
                Contact
              </Link>
            </div>
          </NavbarLeft>

          {/* Center Section with Logo on both Mobile and Desktop */}
          <NavbarCenter className="flex items-center md:w-1/3">
            <Link href="/" className="flex items-center justify-center">
              <Image
                src={theme === "dark" ? logoDark : logo}
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
                <ShoppingCart className="w-6 h-6 text-foreground" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </span>
                )}
              </Link>
              <Link href="/wishlist" className="relative">
                <Heart className="w-6 h-6 text-foreground" />
                {wishlistItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistItemCount > 99 ? "99+" : wishlistItemCount}
                  </span>
                )}
              </Link>
              <ModeToggle />
              <button
                onClick={toggleMobileMenu}
                className="text-foreground focus:outline-none"
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
              <Link href="/wishlist" className="group relative">
                <Heart className="w-6 h-6 text-foreground group-hover:text-accent transition-colors" />
                {wishlistItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistItemCount > 99 ? "99+" : wishlistItemCount}
                  </span>
                )}
              </Link>
              <Link href="/cart" className="group relative">
                <ShoppingCart className="w-6 h-6 text-foreground group-hover:text-accent transition-colors" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </span>
                )}
              </Link>
              <ModeToggle />{" "}
              {session?.user ? (
                <div className="relative group">
                  <SafeAvatar
                    src={session.user.image}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="cursor-pointer border-2 border-transparent group-hover:border-accent transition-colors"
                  />
                  <div className="absolute right-0 w-48 mt-2 py-2 bg-background rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                    >
                      Profile
                    </Link>
                    {session?.user?.isAdmin && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                      >
                        Admin
                      </Link>
                    )}

                    <button
                      onClick={() => signOut()}
                      className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              ) : (
                <Link href="/login">
                  <Button
                    variant="secondary"
                    className="bg-accent hover:bg-accent/90 text-accent-foreground"
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
        <div className="md:hidden fixed inset-0 bg-background z-40 pt-20 pb-6 px-6 overflow-y-auto">
          <div className="flex flex-col space-y-6">
            <div className="pt-2 pb-4">
              <SearchBar />
            </div>

            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-lg font-medium text-foreground hover:text-accent py-2 border-b border-border"
                onClick={toggleMobileMenu}
              >
                Home
              </Link>{" "}
              <Link
                href="/categories"
                className="text-lg font-medium text-foreground hover:text-accent py-2 border-b border-border"
                onClick={toggleMobileMenu}
              >
                Categories
              </Link>
              <Link
                href="/products"
                className="text-lg font-medium text-foreground hover:text-accent py-2 border-b border-border"
                onClick={toggleMobileMenu}
              >
                Products
              </Link>
              <Link
                href="/about"
                className="text-lg font-medium text-foreground hover:text-accent py-2 border-b border-border"
                onClick={toggleMobileMenu}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-lg font-medium text-foreground hover:text-accent py-2 border-b border-border"
                onClick={toggleMobileMenu}
              >
                Contact
              </Link>
            </nav>

            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <Link
                  href="/wishlist"
                  className="relative"
                  onClick={toggleMobileMenu}
                >
                  <Heart className="w-6 h-6 text-foreground" />
                  {wishlistItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {wishlistItemCount > 9 ? "9+" : wishlistItemCount}
                    </span>
                  )}
                </Link>
                <ModeToggle />
              </div>{" "}
              {session?.user ? (
                <div className="flex items-center space-x-3">
                  <SafeAvatar
                    src={session.user.image}
                    alt="Profile"
                    width={40}
                    height={40}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
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
                    className="bg-accent hover:bg-purple-700 text-accent-foreground"
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
