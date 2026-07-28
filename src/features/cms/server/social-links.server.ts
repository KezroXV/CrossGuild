import prisma from "@/shared/lib/prisma";

const DEFAULT_SOCIAL_LINKS = {
  facebook: "https://facebook.com/crossguild",
  twitter: "https://twitter.com/crossguild",
  instagram: "https://instagram.com/crossguild",
  linkedin: "https://linkedin.com/company/crossguild",
};

export type SocialLinksInput = {
  facebook?: string | null;
  twitter?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
};

export function isMissingSocialLinksTable(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("does not exist in the current database");
}

export async function getSocialLinks() {
  const socialLinks = await prisma.socialLinks.findFirst();

  if (!socialLinks) {
    return prisma.socialLinks.create({ data: DEFAULT_SOCIAL_LINKS });
  }

  return socialLinks;
}

export async function updateSocialLinks(data: SocialLinksInput) {
  const existingLinks = await prisma.socialLinks.findFirst();

  if (existingLinks) {
    return prisma.socialLinks.update({
      where: { id: existingLinks.id },
      data: {
        facebook: data.facebook,
        twitter: data.twitter,
        instagram: data.instagram,
        linkedin: data.linkedin,
      },
    });
  }

  return prisma.socialLinks.create({ data });
}
