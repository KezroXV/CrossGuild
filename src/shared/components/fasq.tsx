/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { motion, AnimatePresence, motion as m } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@radix-ui/react-accordion";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import {
  fetchPublishedFaqs,
  submitFaqQuestion,
  type PublishedFaq,
} from "@/features/cms/services/cms.service";
import arrow from "@/public/Vector.png";
import { toast } from "sonner";

const Faqs = () => {
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [messageSent, setMessageSent] = useState(false);
  const [question, setQuestion] = useState("");
  const [faqs, setFaqs] = useState<PublishedFaq[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadFaqs = async () => {
      setLoading(true);
      try {
        const publishedFaqs = await fetchPublishedFaqs();
        setFaqs(publishedFaqs);
      } catch (error) {
        console.error("Failed to fetch FAQs", error);
        setFaqs([]);
      } finally {
        setLoading(false);
      }
    };

    loadFaqs();
  }, []);

  const handleToggle = (item: string) => {
    setOpenItem(openItem === item ? null : item);
  };

  const handleSend = async () => {
    if (!question.trim()) {
      toast.error("Please enter a question");
      return;
    }

    try {
      await submitFaqQuestion(question);
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
    <div className="my-32 max-w-5xl mx-auto mt-10 p-4 sm:p-6 md:mt-20 rounded-lg">
      {/* Header Section */}
      <motion.div
        className="text-center mb-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInVariant}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <h1 className="bg-gradient-to-r from-accent via-primary to-accent text-3xl sm:text-4xl md:text-5xl font-bold inline-block bg-clip-text text-transparent animate-gradient">
          Questions Fréquentes
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground mt-3">
          Trouvez rapidement des réponses à vos questions
        </p>
      </motion.div>

      {/* Accordion Section */}
      <Accordion type="single" collapsible className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          displayFaqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInVariant}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <AccordionItem
                value={faq.id}
                className="border-2 border-accent/20 hover:border-accent/50 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-accent/10"
              >
                <AccordionTrigger
                  className="w-full flex justify-between items-center text-left text-base sm:text-lg font-semibold p-5 transition-all bg-background hover:bg-accent/5"
                  onClick={() => handleToggle(faq.id)}
                >
                  <span className="pr-4">
                    {typeof faq.question === "string"
                      ? faq.question.toUpperCase()
                      : faq.question}
                  </span>
                  <Image
                    src={arrow}
                    alt="arrow"
                    width={20}
                    height={20}
                    className={`transition-transform duration-300 flex-shrink-0 ${
                      openItem === faq.id ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </AccordionTrigger>
                <AnimatePresence initial={false} mode="wait">
                  {openItem === faq.id && (
                    <m.div
                      key={faq.id + "-content"}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <AccordionContent className="p-5 text-sm sm:text-base md:text-lg text-foreground/90 bg-gradient-to-br from-muted/50 to-muted leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </m.div>
                  )}
                </AnimatePresence>
              </AccordionItem>
            </motion.div>
          ))
        )}
      </Accordion>

      {/* Contact Section */}
      <motion.div
        className="mt-12 p-6 bg-gradient-to-br from-accent/5 to-primary/5 rounded-xl border border-accent/10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInVariant}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <h3 className="text-xl font-bold mb-4 text-foreground">
          Vous avez d&apos;autres questions ?
        </h3>
        <textarea
          className="w-full resize-none h-28 sm:h-32 md:h-36 p-4 border-2 border-border focus:border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 bg-background text-foreground transition-all duration-300"
          placeholder="Posez votre question ici..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        ></textarea>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-4">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              📧 Nous répondrons à votre question par email sous 48 heures.
            </p>
            {messageSent && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-2"
              >
                ✓ Votre question a été envoyée avec succès !
              </motion.p>
            )}
          </div>

          <button
            onClick={handleSend}
            className="px-8 py-3 bg-accent text-accent-foreground font-semibold rounded-lg transition-all hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/30 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent active:scale-95"
          >
            Envoyer
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Faqs;
