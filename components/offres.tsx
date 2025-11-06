"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

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
    <div className="my-28 text-left px-4">
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-3xl md:text-4xl font-bold text-accent w-fit mx-auto md:mx-0 md:ml-8 lg:ml-24 xl:ml-32 mb-12"
      >
        Exclusive Deals{" "}
        <span className="text-black dark:text-white">You Can&apos;t Miss!</span>
      </motion.h1>
      <div className="flex flex-col md:flex-row w-full md:w-11/12 lg:w-4/5 mx-auto justify-between gap-6 md:gap-8">
        {offers.map((offer, index) => (
          <motion.div
            key={offer.id}
            className="bg-gradient-to-bl shadow-lg hover:shadow-2xl from-[#988AE6] to-accent flex flex-col md:flex-row flex-1 justify-between text-white p-6 md:p-8 rounded-xl relative overflow-hidden group transition-all duration-300 hover:scale-105"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideFromLeft}
            transition={{ duration: 0.8, delay: index * 0.2 }}
          >
            {/* Effet de brillance au survol */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

            {/* Contenu à gauche */}
            <div className="flex flex-col justify-center w-full md:w-3/5 pr-0 md:pr-4 mb-4 md:mb-0 relative z-10">
              {/* Bouton amélioré avec une forme coupante plus propre */}
              <div className="mb-4">
                <div className="inline-block relative">
                  <div className="bg-primary text-white text-xs md:text-sm font-semibold py-2 pl-5 pr-8 shadow-md">
                    {offer.buttonLabel || "Free Delivery"}
                  </div>
                  <div className="absolute top-0 right-0 h-full w-6 bg-primary transform translate-x-1/2 skew-x-[30deg] origin-top-left shadow-md"></div>
                </div>
              </div>

              <h2 className="text-xl md:text-2xl font-bold mb-2 drop-shadow-md">
                {offer.title}
              </h2>
              <p className="text-2xl md:text-3xl font-bold drop-shadow-md">
                {offer.description}
              </p>
            </div>

            {/* Image à droite avec taille fixe stricte */}
            <div className="flex-shrink-0 flex items-center justify-center w-full md:w-2/5 relative z-10">
              <div className="w-full max-w-[200px] h-[150px] md:w-[200px] md:h-[150px] relative group-hover:scale-110 transition-transform duration-300">
                <Image
                  src={offer.image}
                  alt={offer.title}
                  fill
                  style={{ objectFit: "contain" }}
                  sizes="200px"
                  className="drop-shadow-xl"
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
