"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function ContactFAQ() {
  const faqs = [
    {
      question: "What are your shipping times?",
      answer:
        "Our standard shipping typically takes 3-5 business days within the country and 7-14 business days for international orders. Express shipping options are available at checkout for faster delivery.",
    },
    {
      question: "How can I track my order?",
      answer:
        "Once your order ships, you'll receive a tracking number via email. You can use this number on our website or the carrier's site to track your package's status and estimated delivery date.",
    },
    {
      question: "What is your return policy?",
      answer:
        "We offer a 30-day return policy for most items in their original condition. To initiate a return, please visit your account page or contact our customer support team with your order number.",
    },
    {
      question: "Do you offer international shipping?",
      answer:
        "Yes, we ship to most countries worldwide. International shipping rates and delivery times vary by location. You can see the shipping options available to your country during checkout.",
    },
    {
      question: "How can I change or cancel my order?",
      answer:
        "If you need to change or cancel your order, please contact us as soon as possible. We process orders quickly, but we'll do our best to accommodate changes if your order hasn't shipped yet.",
    },
  ];

  return (
    <div className="py-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-2">Frequently Asked Questions</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Find quick answers to common questions about our services and
          policies. If you don&apos;t see what you&apos;re looking for, feel
          free to reach out.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="text-center mt-10">
        <p className="text-muted-foreground mb-3">Still have questions?</p>
        <a
          href="mailto:support@crossguild.com"
          className="font-medium text-primary hover:underline"
        >
          Get in touch with our support team
        </a>
      </div>
    </div>
  );
}
