"use client";

import { Star, MessageSquareText, Mail } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import ReviewsTab from "@/features/admin/components/reviews/reviews-tab.component";
import FaqsTab from "@/features/admin/components/reviews/faqs-tab.component";
import ContactsTab from "@/features/admin/components/reviews/contacts-tab.component";

export default function ReviewsView() {
  return (
    <div className="p-6 max-w-[95%] mx-auto">
      <Tabs defaultValue="reviews" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="reviews" className="flex items-center gap-2 px-6 py-3">
            <Star className="h-5 w-5" />
            Reviews
          </TabsTrigger>
          <TabsTrigger value="faqs" className="flex items-center gap-2 px-6 py-3">
            <MessageSquareText className="h-5 w-5" />
            FAQs
          </TabsTrigger>
          <TabsTrigger value="contacts" className="flex items-center gap-2 px-6 py-3">
            <Mail className="h-5 w-5" />
            Contact Messages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="mt-4">
          <ReviewsTab />
        </TabsContent>
        <TabsContent value="faqs" className="mt-4">
          <FaqsTab />
        </TabsContent>
        <TabsContent value="contacts" className="mt-4">
          <ContactsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
