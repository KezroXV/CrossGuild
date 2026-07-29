export type HeroContent = {
  id: string;
  tagline: string;
  heading: string;
  highlightedText: string;
  description: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  backgroundImage: string;
};

export type CategoryHeroContent = {
  id: string;
  heading: string;
  highlightedText: string;
  description: string;
  buttonText: string;
  backgroundImage: string;
};

export type Offer = {
  id: string;
  title: string;
  description: string;
  image: string;
  buttonLabel: string;
};

export type NewOfferInput = {
  title: string;
  description: string;
  buttonLabel: string;
};

export type ContactInfo = {
  id: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone1: string;
  phone2?: string | null;
  email1: string;
  email2?: string | null;
  businessHours: string;
  mapEmbedUrl: string;
};

export type SocialLinks = {
  id: string;
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
};
