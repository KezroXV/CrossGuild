"use client";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@radix-ui/react-accordion";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import axios from "axios";
import arrow from "@/public/Vector.png";
import { toast } from "sonner";

interface FAQ {
  id: string;
  question: string;
  answer: string | null;
  isPublished: boolean;
}

const Faqs = () => {
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [messageSent, setMessageSent] = useState(false);
  const [question, setQuestion] = useState("");
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPublishedFaqs();
  }, []);

  const fetchPublishedFaqs = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/admin/reviews", {
        params: { type: "faqs" },
      });

      // Defensive programming - ensure we have an array of FAQs
      if (response.data && response.data.faqs) {
        // Filter only published FAQs with answers for the public view
        const publishedFaqs = response.data.faqs.filter(
          (faq: FAQ) => faq.isPublished && faq.answer
        );
        setFaqs(publishedFaqs);
      } else {
        console.error("No FAQs found in response:", response.data);
        setFaqs([]); // Initialize with empty array if no data
      }
    } catch (error) {
      console.error("Failed to fetch FAQs", error);
      setFaqs([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (item: string) => {
    setOpenItem(openItem === item ? null : item);
  };

  const handleSend = async () => {
    if (!question.trim()) {
      toast.error("Please enter a question");
      return;
    }

    try {
      await axios.patch("/api/admin/reviews", { question });
      setMessageSent(true);
      setQuestion("");
      toast.success("Your question has been sent successfully!");

      // Reset the success message after 3 seconds
      setTimeout(() => {
        setMessageSent(false);
      }, 3000);
    } catch (error) {
      toast.error("Failed to send your question. Please try again.");
    }
  };

  // Animation variants
  const fadeInVariant = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  // Define default FAQs as a fallback
  const defaultFaqs = [
    {
      id: "default-1",
      question: "WHAT MAKES YOUR STORE DIFFERENT FROM OTHERS?",
      answer:
        "Our AI leverages advanced algorithms to ensure relevance and creativity.",
      isPublished: true,
    },
    {
      id: "default-2",
      question: "HOW LONG DOES SHIPPING TAKE?",
      answer:
        "Shipping takes 3 to 7 business days for standard delivery and 1 to 3 business days for express shipping, with a tracking number provided upon dispatch.",
      isPublished: true,
    },
    {
      id: "default-3",
      question: "WHAT'S YOUR RETURN POLICY?",
      answer:
        "You can return an unused item in its original packaging within 14 days of receipt, with potential return shipping fees depending on the reason; contact our support team with your order number to initiate a return.",
      isPublished: true,
    },
  ];

  // Always ensure we have an array to work with
  const displayFaqs = faqs && faqs.length > 0 ? faqs : defaultFaqs;

  return (
    <div className="my-28 max-w-4xl mx-auto mt-10 p-4 sm:p-6 md:mt-20 rounded-lg">
      {/* Header Section */}
      <motion.div
        className="text-center mb-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInVariant}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <h1 className="bg-gradient-to-r from-foreground to-foreground text-3xl sm:text-4xl md:text-5xl font-bold inline-block bg-clip-text text-transparent">
          FAQ&apos;s
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground mt-2">
          Providing answers to your questions
        </p>
      </motion.div>

      {/* Accordion Section */}
      <Accordion type="single" collapsible className="space-y-4">
        {loading ? (
          <p className="text-center py-4 text-muted-foreground">
            Loading FAQs...
          </p>
        ) : (
          displayFaqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInVariant}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <AccordionItem
                value={faq.id}
                className="border-2 border-accent rounded-md overflow-hidden"
              >
                <AccordionTrigger
                  className="w-full flex justify-between items-center text-left text-base sm:text-lg font-medium p-4 transition-all bg-background hover:bg-muted"
                  onClick={() => handleToggle(faq.id)}
                >
                  {typeof faq.question === "string"
                    ? faq.question.toUpperCase()
                    : faq.question}
                  <Image
                    src={arrow}
                    alt="arrow"
                    className={`transition-transform ${
                      openItem === faq.id ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </AccordionTrigger>
                <AccordionContent className="p-4 text-sm sm:text-base md:text-lg text-foreground bg-muted">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))
        )}
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
          className="w-full resize-none h-24 sm:h-28 md:h-32 p-4 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
          placeholder="Still have questions? Write to us!"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        ></textarea>
        <div className="flex flex-col sm:flex-row justify-between mt-4">
          <div>
            <p className="text-sm text-muted-foreground">
              We will answer your question via email within 48 hours.
            </p>
            {messageSent && (
              <p className="mt-2 text-sm text-green-500">
                Your question has been successfully sent!
              </p>
            )}
          </div>

          <button
            onClick={handleSend}
            className="mt-2 sm:mt-0 px-6 py-2 bg-accent text-accent-foreground font-medium rounded-md transition-all hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-secondary"
          >
            Send
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Faqs;
