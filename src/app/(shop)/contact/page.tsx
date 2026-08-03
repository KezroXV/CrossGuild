import { Metadata } from "next";
import ContactView from "@/features/contact/views/contact.view";

export const metadata: Metadata = {
  title: "Contact Us | CrossGuild",
  description: "Get in touch with our team for any inquiries or support",
};

export default function ContactPage() {
  return <ContactView />;
}
