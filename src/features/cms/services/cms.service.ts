import { API_BASE_URL } from "@/config/config";
import type {
  CategoryHeroContent,
  ContactInfo,
  HeroContent,
  Offer,
  SocialLinks,
} from "@/features/cms/types/cms.type";

async function parseResponse<T>(res: Response): Promise<T> {
  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Request failed"
    );
  }

  return data as T;
}

export async function fetchHeroContent(): Promise<HeroContent> {
  const res = await fetch(`${API_BASE_URL}/api/content/hero`, {
    credentials: "include",
  });
  return parseResponse<HeroContent>(res);
}

export async function updateHeroContent(formData: FormData): Promise<HeroContent> {
  const res = await fetch(`${API_BASE_URL}/api/content/hero`, {
    method: "PUT",
    credentials: "include",
    body: formData,
  });
  return parseResponse<HeroContent>(res);
}

export async function fetchCategoryHeroContent(): Promise<CategoryHeroContent> {
  const res = await fetch(`${API_BASE_URL}/api/content/category-hero`, {
    credentials: "include",
  });
  return parseResponse<CategoryHeroContent>(res);
}

export async function updateCategoryHeroContent(
  formData: FormData
): Promise<CategoryHeroContent> {
  const res = await fetch(`${API_BASE_URL}/api/content/category-hero`, {
    method: "PUT",
    credentials: "include",
    body: formData,
  });
  return parseResponse<CategoryHeroContent>(res);
}

export async function fetchOffers(): Promise<Offer[]> {
  const res = await fetch(`${API_BASE_URL}/api/offers`, {
    credentials: "include",
  });
  return parseResponse<Offer[]>(res);
}

export async function createOffer(formData: FormData): Promise<Offer> {
  const res = await fetch(`${API_BASE_URL}/api/offers`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  return parseResponse<Offer>(res);
}

export async function updateOffer(
  id: string,
  formData: FormData
): Promise<Offer> {
  const res = await fetch(`${API_BASE_URL}/api/offers/${id}`, {
    method: "PUT",
    credentials: "include",
    body: formData,
  });
  return parseResponse<Offer>(res);
}

export async function deleteOffer(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/offers/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  await parseResponse<{ success?: boolean }>(res);
}

export async function fetchContactInfo(): Promise<ContactInfo> {
  const res = await fetch(`${API_BASE_URL}/api/content/contact-info`, {
    credentials: "include",
  });
  return parseResponse<ContactInfo>(res);
}

export async function updateContactInfo(
  contactInfo: ContactInfo
): Promise<ContactInfo> {
  const res = await fetch(`${API_BASE_URL}/api/content/contact-info`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(contactInfo),
  });
  return parseResponse<ContactInfo>(res);
}

export async function fetchSocialLinks(): Promise<SocialLinks> {
  const res = await fetch(`${API_BASE_URL}/api/content/social-links`, {
    credentials: "include",
  });
  return parseResponse<SocialLinks>(res);
}

export async function updateSocialLinks(
  socialLinks: SocialLinks
): Promise<SocialLinks> {
  const res = await fetch(`${API_BASE_URL}/api/content/social-links`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(socialLinks),
  });
  return parseResponse<SocialLinks>(res);
}

export type PublishedFaq = {
  id: string;
  question: string;
  answer: string | null;
  isPublished: boolean;
};

export async function fetchPublishedFaqs(): Promise<PublishedFaq[]> {
  const res = await fetch(
    `${API_BASE_URL}/api/admin/reviews?type=faqs`,
    { credentials: "include" }
  );

  const data = await parseResponse<{ faqs?: PublishedFaq[] }>(res);
  return (data.faqs ?? []).filter((faq) => faq.isPublished && faq.answer);
}

export async function submitFaqQuestion(question: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/admin/reviews`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  await parseResponse<{ faq: PublishedFaq }>(res);
}
