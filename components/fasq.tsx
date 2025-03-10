"use client";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@radix-ui/react-accordion";
import Image from "next/image";
import React, { useState } from "react";
import arrow from "@/public/Vector.png";

const Faqs = () => {
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [messageSent, setMessageSent] = useState(false);

  const handleToggle = (item: string) => {
    setOpenItem(openItem === item ? null : item);
  };

  const handleSend = () => {
    setMessageSent(true);
  };

  // Animation variants
  const fadeInVariant = {
    hidden: { opacity: 0, y: 50 }, // État initial : invisible et légèrement décalé
    visible: { opacity: 1, y: 0 }, // État final : visible
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4 sm:p-6 md:mt-20 rounded-lg">
      {/* Header Section */}
      <motion.div
        className="text-center mb-8"
        initial="hidden"
        whileInView="visible" // Animation au scroll
        viewport={{ once: true, amount: 0.3 }} // Visible dès que 30% de l'élément entre dans la vue
        variants={fadeInVariant}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <h1 className="bg-gradient-to-r from-black to-black text-3xl sm:text-4xl md:text-5xl font-bold inline-block bg-clip-text text-transparent">
          FAQ&apos;s
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-500 mt-2">
          Providing answers to your questions
        </p>
      </motion.div>

      {/* Accordion Section */}
      <Accordion type="single" collapsible className="space-y-4">
        {[1, 2, 3].map((item) => (
          <motion.div
            key={item}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInVariant}
            transition={{ duration: 0.5, delay: item * 0.2 }}
          >
            <AccordionItem
              value={`item-${item}`}
              className="border-2 border-accent rounded-md overflow-hidden"
            >
              <AccordionTrigger
                className="w-full flex justify-between items-center text-left text-base sm:text-lg font-medium p-4 transition-all bg-white hover:bg-gray-100"
                onClick={() => handleToggle(`item-${item}`)}
              >
                {item === 1
                  ? "WHAT MAKES YOUR STORE DIFFERENT FROM OTHERS?"
                  : item === 2
                  ? "IS THERE A FREE TRIAL?"
                  : "CAN I CANCEL MY SUBSCRIPTION ANYTIME?"}
                <Image
                  src={arrow}
                  alt="arrow"
                  className={`transition-transform ${
                    openItem === `item-${item}` ? "rotate-180" : "rotate-0"
                  }`}
                />
              </AccordionTrigger>
              <AccordionContent className="p-4 text-sm sm:text-base md:text-lg text-gray-700 bg-gray-50">
                {item === 1
                  ? "Our AI leverages advanced algorithms to ensure relevance and creativity."
                  : item === 2
                  ? "Yes, we offer a free trial so you can explore some features of IdeateAI."
                  : "Absolutely! You can cancel your subscription anytime without any hidden fees."}
              </AccordionContent>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>

      {/* Contact Section */}
      <motion.div
        className="mt-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInVariant}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <textarea
          className="w-full resize-none h-24 sm:h-28 md:h-32 p-4 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Still have questions? Write to us!"
        ></textarea>
        <div className="flex flex-col sm:flex-row justify-between mt-4">
          <div>
            <p className="text-sm text-gray-500">
              We will answer your question via email within 48 hours.
            </p>
            {messageSent && (
              <p className="mt-2 text-sm text-gray-500">
                Your message has been successfully sent!
              </p>
            )}
          </div>

          <button
            onClick={handleSend}
            className="mt-2 sm:mt-0 px-6 py-2 bg-accent text-white font-medium rounded-md transition-all hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-secondary"
          >
            Send
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Faqs;
