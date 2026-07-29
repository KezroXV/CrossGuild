"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import HeroEditor from "@/features/cms/components/hero-editor.component";
import CategoryHeroEditor from "@/features/cms/components/category-hero-editor.component";
import OffersManager from "@/features/cms/components/offers-manager.component";
import ContactInfoEditor from "@/features/cms/components/contact-info-editor.component";
import SocialLinksEditor from "@/features/cms/components/social-links-editor.component";

export default function ContentManagementView() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Content Management</h1>

      <Tabs defaultValue="hero-sections" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="hero-sections">Hero Sections</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
          <TabsTrigger value="contact-info">Contact Info</TabsTrigger>
        </TabsList>

        <TabsContent value="hero-sections">
          <div className="grid gap-8">
            <Accordion type="single" collapsible defaultValue="home-hero">
              <AccordionItem value="home-hero">
                <AccordionTrigger className="text-xl font-semibold">
                  Home Page Hero Section
                </AccordionTrigger>
                <AccordionContent>
                  <HeroEditor />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="category-hero">
                <AccordionTrigger className="text-xl font-semibold">
                  Category Page Hero Section
                </AccordionTrigger>
                <AccordionContent>
                  <CategoryHeroEditor />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </TabsContent>

        <TabsContent value="offers">
          <OffersManager />
        </TabsContent>

        <TabsContent value="contact-info">
          <div className="grid gap-8">
            <Accordion type="single" collapsible defaultValue="location-info">
              <AccordionItem value="location-info">
                <AccordionTrigger className="text-xl font-semibold">
                  Location & Contact Information
                </AccordionTrigger>
                <AccordionContent>
                  <ContactInfoEditor />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="social-media">
                <AccordionTrigger className="text-xl font-semibold">
                  Social Media Links
                </AccordionTrigger>
                <AccordionContent>
                  <SocialLinksEditor />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
