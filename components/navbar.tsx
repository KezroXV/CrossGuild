"use client";
import { Button } from "@/components/ui/button";
import SearchBar from "./searchBar";
import { ShoppingCart, Heart } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Image from "next/image";

export const Navbar = () => {
  const { data: session } = useSession();

  return (
    <nav className="flex justify-between items-center p-4 bg-black text-white">
      <div className="text-xl font-bold">XF</div>
      <ul className="flex gap-6">
        <li>Home</li>
        <li>Categories</li>
        <li>About</li>
        <li>Contact</li>
      </ul>
      <SearchBar />
      <div className="flex gap-4">
        {session?.user ? (
          <Image
            src={session.user.image || "/default-avatar.png"}
            alt="Profile"
            width={40}
            height={40}
            className="rounded-full cursor-pointer"
          />
        ) : (
          <Link href="/login">
            <Button variant="secondary">Login</Button>
          </Link>
        )}
        <Heart className="cursor-pointer" />
        <ShoppingCart className="cursor-pointer" />
      </div>
    </nav>
  );
};
