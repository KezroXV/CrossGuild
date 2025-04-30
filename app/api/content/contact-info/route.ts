import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Try to fetch existing contact info
    const contactInfo = await prisma.contactInfo.findFirst();

    // If no contact info exists, create a default one
    if (!contactInfo) {
      const newContactInfo = await prisma.contactInfo.create({
        data: {
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
        },
      });
      return NextResponse.json(newContactInfo);
    }

    return NextResponse.json(contactInfo);
  } catch (error) {
    console.error("Error fetching contact info:", error);

    // Check if it's a PrismaClient initialization error or missing table error
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("does not exist in the current database")) {
      return NextResponse.json(
        {
          error:
            "The ContactInfo table doesn't exist yet. Please run Prisma migrations.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch contact information" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();

    // Find existing record
    const existingInfo = await prisma.contactInfo.findFirst();

    let updatedInfo;
    if (existingInfo) {
      // Update existing record
      updatedInfo = await prisma.contactInfo.update({
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
    } else {
      // Create new record if none exists
      updatedInfo = await prisma.contactInfo.create({
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

    return NextResponse.json(updatedInfo);
  } catch (error) {
    console.error("Error updating contact info:", error);
    return NextResponse.json(
      { error: "Failed to update contact information" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
