import prisma from "@/shared/lib/prisma";

const DEFAULT_CONTACT_INFO = {
  address: "123 Commerce Street",
  city: "Business District",
  postalCode: "75000",
  country: "France",
  phone1: "+33 (0)1 23 45 67 89",
  phone2: "+33 (0)9 87 65 43 21",
  email1: "contact@crossguild.com",
  email2: "support@crossguild.com",
  businessHours:
    "Monday - Friday: 9am - 6pm\nSaturday: 10am - 4pm\nSunday: Closed",
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.9916256937595!2d2.292292615509614!3d48.85837007928746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66e2964e34e2d%3A0x8ddca9ee380ef7e0!2sEiffel%20Tower!5e0!3m2!1sen!2sfr!4v1631451076910!5m2!1sen!2sfr",
};

export type ContactInfoInput = {
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

export function isMissingContactInfoTable(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("does not exist in the current database");
}

export async function getContactInfo() {
  const contactInfo = await prisma.contactInfo.findFirst();

  if (!contactInfo) {
    return prisma.contactInfo.create({ data: DEFAULT_CONTACT_INFO });
  }

  return contactInfo;
}

export async function updateContactInfo(data: ContactInfoInput) {
  const existingInfo = await prisma.contactInfo.findFirst();

  if (existingInfo) {
    return prisma.contactInfo.update({
      where: { id: existingInfo.id },
      data: {
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country,
        phone1: data.phone1,
        phone2: data.phone2,
        email1: data.email1,
        email2: data.email2,
        businessHours: data.businessHours,
        mapEmbedUrl: data.mapEmbedUrl,
      },
    });
  }

  return prisma.contactInfo.create({ data });
}
