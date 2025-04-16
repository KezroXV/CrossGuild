"use client";
import Cart from "@/components/cart";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";

const CartPage = () => {
  const { data: session } = useSession();
  const [city, setCity] = useState("");

  useEffect(() => {
    // Try to get city from session storage first
    const savedCity = sessionStorage.getItem("userCity");
    if (savedCity) {
      setCity(savedCity);
    } else if (session?.user?.city) {
      // If not in storage but available in user profile, use that
      setCity(session.user.city);
      sessionStorage.setItem("userCity", session.user.city);
    }
  }, [session]);

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCity = e.target.value;
    setCity(newCity);
    // Store in session storage to persist during the shopping session
    sessionStorage.setItem("userCity", newCity);

    // Optionally, you could also update the user profile if they're logged in
    if (session?.user) {
      fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ city: newCity }),
      }).catch((error) => console.error("Failed to update city:", error));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <Label htmlFor="city" className="text-sm font-medium text-gray-700">
            Shipping City
          </Label>
          <Input
            id="city"
            type="text"
            placeholder="Enter your city"
            value={city}
            onChange={handleCityChange}
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">
            This information will be used for shipping and order processing.
          </p>
        </div>
        <Cart userCity={city} />
      </div>
    </div>
  );
};

export default CartPage;
