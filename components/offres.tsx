"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const slideFromLeft = {
  hidden: { opacity: 0, x: -100 },
  visible: { opacity: 1, x: 0 },
};

interface Offer {
  id: string;
  title: string;
  description: string;
  image: string;
  buttonLabel: string;
}

const ExclusiveDeals = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await fetch("/api/offers");

        if (response.ok) {
          const data = await response.json();
          setOffers(data);
        } else {
          console.error("Failed to fetch offers:", response.statusText);
        }
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
      <h1 className="text-4xl font-bold text-accent w-fit ml-48 mb-12">
        Exclusive Deals{" "}
        <span className="text-black dark:text-white">You Can't Miss!</span>
      </h1>
      <div className="flex w-4/5 mx-auto justify-between gap-8">
        {offers.map((offer) => (
          <motion.div
            key={offer.id}
            className="bg-gradient-to-bl shadow-md from-[#988AE6] to-accent flex flex-1 justify-between text-white p-6 rounded-lg relative overflow-hidden"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideFromLeft}
            transition={{ duration: 1 }}
          >
            {/* Contenu à gauche */}
            <div className="flex flex-col justify-center w-3/5 pr-4">
              {/* Bouton amélioré avec une forme coupante plus propre */}
              <div className="mb-3">
                <div className="inline-block relative">
                  <div className="bg-primary text-white text-sm font-medium py-1.5 pl-4 pr-6">
                    {offer.buttonLabel || "Free Delivery"}
                  </div>
                  <div className="absolute top-0 right-0 h-full w-6 bg-primary transform translate-x-1/2 skew-x-[30deg] origin-top-left"></div>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-2">{offer.title}</h2>
              <p className="text-3xl font-bold">{offer.description}</p>
            </div>

            {/* Image à droite avec taille fixe stricte */}
            <div className="flex-shrink-0 flex items-center justify-center w-2/5">
              <div className="w-[200px] h-[150px] relative">
                <Image
                  src={offer.image}
                  alt={offer.title}
                  fill
                  style={{ objectFit: "contain" }}
                  sizes="200px"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ExclusiveDeals;
