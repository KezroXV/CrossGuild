"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import Image from "next/image";

const slideFromLeft = {
  hidden: { opacity: 0, x: -100 },
  visible: { opacity: 1, x: 0 },
};

const slideFromRight = {
  hidden: { opacity: 0, x: 100 },
  visible: { opacity: 1, x: 0 },
};

const slideFromBottom = {
  hidden: { opacity: 0, y: 100 },
  visible: { opacity: 1, y: 0 },
};

interface Offer {
  id: string;
  title: string;
  description: string;
  image: string;
}

const ExclusiveDeals = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await fetch("/api/offers");
        const data = await response.json();
        setOffers(data);
      } catch (error) {
        console.error("Failed to fetch offers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOffers();
  }, []);

  if (isLoading) {
    return <div className="container mx-auto py-8">Chargement...</div>;
  }

  return (
    <div className="my-28 text-left">
      <h1 className="text-4xl font-bold text-accent w-fit ml-48">
        Exclusive Deals <span className="text-black">You Can’t Miss!</span>
      </h1>
      <div className="flex w-4/5 mx-auto justify-between my-8 gap-8">
        {offers.map((offer) => (
          <motion.div
            key={offer.id}
            className="bg-gradient-to-bl shadow-md from-[#988AE6] to-accent flex flex-1 justify-evenly text-white p-10 rounded-lg relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideFromLeft}
            transition={{ duration: 1 }}
          >
            <div>
              <div className="text-sm mb-2">
                <Image src={offer.image} alt={offer.title} className="h-auto" />
              </div>
              <div className="mt-7">
                <h2 className="text-left text-3xl font-bold">{offer.title}</h2>
                <p className="text-4xl font-bold text-center">
                  {offer.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ExclusiveDeals;
