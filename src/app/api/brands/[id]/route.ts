import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/shared/lib/with-admin";
import prisma from "@/shared/lib/prisma";
import { join } from "path";
import { existsSync, unlinkSync } from "fs";

export const PUT = withAdmin(
  async (
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
  ) => {
    try {
      const formData = await request.formData();
      const { id } = await context.params;
      const name = formData.get("name") as string;
      const description = formData.get("description") as string;
      const logo = formData.get("logo") as File | string;

      if (!name) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 });
      }

      let logoUrl: string | undefined;

      if (logo && logo instanceof File && logo.size > 0) {
        const logoFormData = new FormData();
        logoFormData.append("file", logo);

        const uploadResponse = await fetch(
          `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/upload`,
          {
            method: "POST",
            body: logoFormData,
            headers: {
              cookie: request.headers.get("cookie") || "",
            },
          }
        );

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          logoUrl = uploadResult.url;
        }
      } else if (logo && typeof logo === "string") {
        logoUrl = logo;
      }

      if (
        logoUrl &&
        (typeof logoUrl !== "string" ||
          (!logoUrl.startsWith("http") &&
            !logoUrl.startsWith("/uploads/") &&
            !logoUrl.includes("cloudinary.com")))
      ) {
        return NextResponse.json(
          {
            error:
              "Logo must be a valid URL (http(s)://, /uploads/... ou cloudinary.com)",
          },
          { status: 400 }
        );
      }

      const brand = await prisma.brand.update({
        where: { id },
        data: {
          name,
          description: description || undefined,
          logo: logoUrl,
        },
        select: {
          id: true,
          name: true,
          logo: true,
          description: true,
        },
      });
      return NextResponse.json(brand);
    } catch (error) {
      console.error("Error updating brand:", error);
      if (error instanceof Error) {
        return NextResponse.json(
          {
            error: "Error updating brand",
            message: error.message,
            stack: error.stack,
          },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: "Error updating brand", message: String(error) },
        { status: 500 }
      );
    }
  }
);

export const DELETE = withAdmin(
  async (
    _request: NextRequest,
    context: { params: Promise<{ id: string }> }
  ) => {
    try {
      const { id } = await context.params;

      const existingBrand = await prisma.brand.findUnique({
        where: { id },
        select: { logo: true },
      });

      if (!existingBrand) {
        return NextResponse.json({ error: "Brand not found" }, { status: 404 });
      }

      if (existingBrand.logo) {
        const logoPath = join(process.cwd(), "public", existingBrand.logo);
        if (existsSync(logoPath)) {
          unlinkSync(logoPath);
        }
      }

      await prisma.brand.delete({
        where: { id },
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error deleting brand:", error);
      return NextResponse.json(
        { error: "Error deleting brand" },
        { status: 500 }
      );
    }
  }
);
